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

function isHtmlLike(response: Response): boolean {
  const type = response.headers.get("content-type") ?? "";
  return type.includes("text/html") || type.includes("text/x-component");
}

function isAdminPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

function isPublicGet(request: Request): boolean {
  if (request.method !== "GET" && request.method !== "HEAD") return false;
  const { pathname } = new URL(request.url);
  if (pathname.startsWith("/api/")) return false;
  if (isAdminPath(pathname)) return false;
  return true;
}

/** Short edge cache for public pages — cuts Worker CPU (Error 1102) under load. */
function withPublicHtmlCache(response: Response): Response {
  if (!isHtmlLike(response)) return response;
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
  headers.set("CDN-Cache-Control", "public, s-maxage=60, stale-while-revalidate=300");
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
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  headers.set("CDN-Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");
  headers.delete("ETag");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function maybeRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  // Only normalize www → apex. Cloudflare already handles HTTP → HTTPS.
  if (url.hostname !== "www.sweetdetails.ink") return null;
  url.hostname = "sweetdetails.ink";
  return Response.redirect(url.toString(), 301);
}

const worker = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const redirect = maybeRedirect(request);
    if (redirect) return redirect;

    const publicGet = isPublicGet(request);
    // `caches` exists in Workers; Node/tests may not define it.
    const cache = typeof caches !== "undefined" ? caches.default : undefined;
    const cacheKey = new Request(request.url, { method: "GET" });

    if (publicGet && cache) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    try {
      const response = await handler.fetch(request, env, ctx);
      const out = publicGet ? withPublicHtmlCache(response) : withNoStoreHtml(response);

      if (publicGet && out.ok && cache) {
        ctx.waitUntil(cache.put(cacheKey, out.clone()));
      }

      return out;
    } catch (err) {
      console.error("[worker] unhandled error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

export default worker;
