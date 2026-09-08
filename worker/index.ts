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

function withNoStoreHtml(response: Response): Response {
  const type = response.headers.get("content-type") ?? "";
  if (!type.includes("text/html") && !type.includes("text/x-component")) return response;
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

    try {
      const response = await handler.fetch(request, env, ctx);
      return withNoStoreHtml(response);
    } catch (err) {
      console.error("[worker] unhandled error:", err);
      return new Response("Internal Server Error", { status: 500 });
    }
  },
};

export default worker;
