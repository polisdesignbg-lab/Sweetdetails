import { isAdminRequest } from "@/lib/admin-auth";
import {
  ensureShopMigrated,
  getCategories,
  getShopSettings,
  getShapes,
  getShopProducts,
  saveCategories,
  saveShapes,
  saveShopProducts,
  saveShopSettings,
} from "@/lib/shop/data";
import type { ShopCategory, ShopProduct, ShopShape } from "@/lib/shop/types";
import type { ShopSettings } from "@/lib/shop/seed";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureShopMigrated();
  const [categories, shapes, products, settings] = await Promise.all([
    getCategories(true),
    getShapes(true),
    getShopProducts(true),
    getShopSettings(),
  ]);
  return Response.json({ categories, shapes, products, settings });
}

export async function PUT(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    categories?: ShopCategory[];
    shapes?: ShopShape[];
    products?: ShopProduct[];
    settings?: ShopSettings;
  };
  if (body.categories) await saveCategories(body.categories);
  if (body.shapes) await saveShapes(body.shapes);
  if (body.products) await saveShopProducts(body.products);
  if (body.settings) await saveShopSettings(body.settings);
  return Response.json({ ok: true });
}
