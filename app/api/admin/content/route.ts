import { isAdminRequest } from "@/lib/admin-auth";
import { saveContent } from "@/lib/data";
import type { Product, SiteSettings } from "@/lib/defaults";

export async function PUT(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as { settings: SiteSettings; products: Product[] };
  if (!body.settings?.brand || !Array.isArray(body.products)) {
    return Response.json({ error: "invalid" }, { status: 400 });
  }
  try {
    await saveContent(body.settings, body.products);
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "save failed" }, { status: 500 });
  }
}
