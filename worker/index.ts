import handler from "vinext/server/app-router-entry";

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  BUCKET: R2Bucket;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

/** Public HTML: longer edge cache + serve stale if Worker fails (traffic spikes / CPU limits). */
const PUBLIC_HTML_CACHE =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400";
const PUBLIC_API_CACHE =
  "public, max-age=60, s-maxage=300, stale-while-revalidate=3600, stale-if-error=86400";

function isHtmlLike(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return type.includes("text/html") || type.includes("text/x-component");
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isPublicApi(pathname: string): boolean {
  return pathname === "/api/shop" || pathname === "/api/content";
}

function isCacheableGet(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const { pathname } = new URL(request.url);
  if (isAdminPath(pathname)) return false;
  if (pathname.startsWith("/api/")) return isPublicApi(pathname);
  return true;
}

function withCacheHeaders(response: Response, cacheControl: string): Response {
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", cacheControl);
  headers.set("CDN-Cache-Control", cacheControl);
  headers.delete("Pragma");
  headers.delete("ETag");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function withNoStoreHtml(response: Response): Response {
  if (!isHtmlLike(response)) return response;
  return withCacheHeaders(
    response,
    "no-cache, no-store, must-revalidate",
  );
}

function maybeRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== "www.sweetdetails.ink") return null;
  url.hostname = "sweetdetails.ink";
  return Response.redirect(url.toString(), 301);
}

function softFailHtml(url: string): Response {
  const html = `<!DOCTYPE html>
<html lang="bg">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="refresh" content="8;url=${url}" />
  <title>Sweet Details</title>
  <style>
    body{margin:0;font-family:system-ui,sans-serif;background:#fff7f9;color:#3b1f2b;
      display:grid;min-height:100vh;place-items:center;padding:24px;text-align:center}
    .card{max-width:420px;background:#fff;border:1px solid #f3d0dc;border-radius:18px;
      padding:28px 22px;box-shadow:0 10px 30px rgba(233,46,114,.08)}
    h1{font-size:1.35rem;margin:0 0 10px}
    p{margin:0 0 18px;line-height:1.5;color:#6b4454}
    a{display:inline-block;background:#e92e72;color:#fff;text-decoration:none;
      padding:12px 18px;border-radius:999px;font-weight:700}
  </style>
</head>
<body>
  <div class="card">
    <h1>Sweet Details зарежда…</h1>
    <p>Сайтът е временно натоварен. Страницата ще се опита да се отвори отново след няколко секунди.</p>
    <a href="${url}">Опитай пак</a>
  </div>
</body>
</html>`;
  return new Response(html, {
    status: 503,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "retry-after": "8",
    },
  });
}

async function serveStaleOrSoftFail(
  cache: Cache | undefined,
  request: Request,
): Promise<Response> {
  if (cache) {
    try {
      const exact = await cache.match(new Request(request.url, { method: "GET" }));
      if (exact) return exact;
      const home = await cache.match(
        new Request(new URL("/", request.url).toString(), { method: "GET" }),
      );
      if (home) return home;
    } catch {
      /* ignore cache read errors */
    }
  }
  return softFailHtml(new URL(request.url).pathname || "/");
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const redirect = maybeRedirect(request);
    if (redirect) return redirect;

    const url = new URL(request.url);
    const cacheable = isCacheableGet(request);
    const cache = typeof caches !== "undefined" ? caches.default : undefined;
    const cacheKey = new Request(request.url, { method: "GET" });

    if (cacheable && cache) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await handler.fetch(request, env, ctx);

      let out = response;
      if (cacheable) {
        if (isPublicApi(url.pathname)) {
          out = withCacheHeaders(response, PUBLIC_API_CACHE);
        } else if (isHtmlLike(response) && !isAdminPath(url.pathname)) {
          out = withCacheHeaders(response, PUBLIC_HTML_CACHE);
        }
      } else {
        out = withNoStoreHtml(response);
      }

      if (cacheable && out.ok && cache) {
        ctx.waitUntil(cache.put(cacheKey, out.clone()));
      }

      return out;
    } catch (err) {
      console.error("[worker] unhandled error:", err);
      // Prefer last good cached page over a hard Cloudflare error screen.
      return serveStaleOrSoftFail(cache, request);
    }
  },
};

export default worker;
