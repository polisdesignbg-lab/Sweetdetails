import { env } from "cloudflare:workers";
import {
  DEFAULT_CATEGORIES,
  DEFAULT_SHAPES,
  DEFAULT_SHOP_PRODUCTS,
  defaultShopSettings,
  SHOP_PACKAGING_INFO,
  SHOP_SETTINGS_KEY,
  type ShopSettings,
} from "./seed";
import type { ShopCatalog, ShopCategory, ShopOrder, ShopProduct, ShopShape } from "./types";

function parse<T>(raw: string): T {
  return JSON.parse(raw) as T;
}

function parseShopProduct(raw: string): ShopProduct | null {
  try {
    const p = JSON.parse(raw) as Partial<ShopProduct>;
    if (!p.id || !p.slug || !p.title || !p.categoryId) return null;
    return {
      quantityStep: 1,
      priceTiers: [],
      shapeIds: [],
      themeColors: [],
      images: [],
      ...p,
    } as ShopProduct;
  } catch {
    return null;
  }
}

async function getShopSettings(): Promise<ShopSettings> {
  try {
    const row = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first<{ data: string }>();
    if (!row) return defaultShopSettings;
    const data = parse<Record<string, unknown>>(row.data);
    const shop = data[SHOP_SETTINGS_KEY] as ShopSettings | undefined;
    return shop ?? defaultShopSettings;
  } catch {
    return defaultShopSettings;
  }
}

async function saveShopSettings(settings: ShopSettings) {
  const row = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first<{ data: string }>();
  const data = row ? parse<Record<string, unknown>>(row.data) : {};
  data[SHOP_SETTINGS_KEY] = settings;
  await env.DB.prepare("INSERT INTO settings (id, data) VALUES (1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data")
    .bind(JSON.stringify(data))
    .run();
}

async function migrateShopDefaults() {
  try {
    const settings = await getShopSettings();
    const version = settings.catalogVersion ?? 0;
    if (version >= 3) return;

    if (version < 2) {
      const productRows = await env.DB.prepare("SELECT id, data FROM products").all<{ id: string; data: string }>();
      const shapeRows = await env.DB.prepare("SELECT id, data FROM shapes").all<{ id: string; data: string }>();
      const batch = [
        ...productRows.results.map(row => {
          const p = parseShopProduct(row.data);
          if (!p) return null;
          p.pricePerUnit = 2;
          p.priceTiers = [];
          p.packagingInfo = SHOP_PACKAGING_INFO;
          return env.DB.prepare("UPDATE products SET data = ? WHERE id = ?").bind(JSON.stringify(p), row.id);
        }).filter(Boolean) as ReturnType<typeof env.DB.prepare>[],
        ...shapeRows.results.map(row => {
          const s = parse<ShopShape>(row.data);
          s.addonPrice = 0;
          return env.DB.prepare("UPDATE shapes SET data = ? WHERE id = ?").bind(JSON.stringify(s), row.id);
        }),
      ];
      if (batch.length) await env.DB.batch(batch);
    }

    await saveShopSettings({ ...settings, minLeadDays: 14, catalogVersion: 3 });
  } catch (err) {
    console.error("[shop] migrateShopDefaults failed:", err);
  }
}

async function seedIfEmpty() {
  const catCount = await env.DB.prepare("SELECT COUNT(*) as c FROM categories").first<{ c: number }>();
  if (catCount && catCount.c > 0) return;

  await env.DB.prepare("DELETE FROM products").run();
  const batch = [
    ...DEFAULT_CATEGORIES.map((c, i) =>
      env.DB.prepare("INSERT INTO categories (id, slug, data, position, active) VALUES (?, ?, ?, ?, ?)")
        .bind(c.id, c.slug, JSON.stringify(c), i, c.active ? 1 : 0),
    ),
    ...DEFAULT_SHAPES.map((s, i) =>
      env.DB.prepare("INSERT INTO shapes (id, data, position, active) VALUES (?, ?, ?, ?)")
        .bind(s.id, JSON.stringify(s), i, s.active ? 1 : 0),
    ),
    ...DEFAULT_SHOP_PRODUCTS.map((p, i) =>
      env.DB.prepare("INSERT INTO products (id, slug, data, position, active) VALUES (?, ?, ?, ?, ?)")
        .bind(p.id, p.slug, JSON.stringify(p), i, p.active ? 1 : 0),
    ),
  ];
  await env.DB.batch(batch);
  await saveShopSettings(defaultShopSettings);
}

export async function getCategories(includeInactive = false): Promise<ShopCategory[]> {
  await seedIfEmpty();
  const q = includeInactive
    ? "SELECT data FROM categories ORDER BY position ASC"
    : "SELECT data FROM categories WHERE active = 1 ORDER BY position ASC";
  const rows = await env.DB.prepare(q).all<{ data: string }>();
  return rows.results.map(r => parse<ShopCategory>(r.data));
}

export async function getCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  const row = await env.DB.prepare("SELECT data FROM categories WHERE slug = ? AND active = 1").bind(slug).first<{ data: string }>();
  return row ? parse<ShopCategory>(row.data) : null;
}

export async function saveCategories(categories: ShopCategory[]) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM categories"),
    ...categories.map((c, i) =>
      env.DB.prepare("INSERT INTO categories (id, slug, data, position, active) VALUES (?, ?, ?, ?, ?)")
        .bind(c.id, c.slug, JSON.stringify({ ...c, position: i }), i, c.active ? 1 : 0),
    ),
  ]);
}

export async function getShapes(includeInactive = false): Promise<ShopShape[]> {
  await seedIfEmpty();
  const q = includeInactive
    ? "SELECT data FROM shapes ORDER BY position ASC"
    : "SELECT data FROM shapes WHERE active = 1 ORDER BY position ASC";
  const rows = await env.DB.prepare(q).all<{ data: string }>();
  return rows.results.map(r => parse<ShopShape>(r.data));
}

export async function saveShapes(shapes: ShopShape[]) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM shapes"),
    ...shapes.map((s, i) =>
      env.DB.prepare("INSERT INTO shapes (id, data, position, active) VALUES (?, ?, ?, ?)")
        .bind(s.id, JSON.stringify({ ...s, position: i }), i, s.active ? 1 : 0),
    ),
  ]);
}

export async function getShopProducts(includeInactive = false): Promise<ShopProduct[]> {
  await seedIfEmpty();
  const q = includeInactive
    ? "SELECT data FROM products ORDER BY position ASC"
    : "SELECT data FROM products WHERE active = 1 ORDER BY position ASC";
  const rows = await env.DB.prepare(q).all<{ data: string }>();
  return rows.results.map(r => parseShopProduct(r.data)).filter((p): p is ShopProduct => p !== null);
}

export async function getProductBySlug(slug: string): Promise<ShopProduct | null> {
  const row = await env.DB.prepare("SELECT data FROM products WHERE slug = ? AND active = 1").bind(slug).first<{ data: string }>();
  return row ? parse<ShopProduct>(row.data) : null;
}

export async function saveShopProducts(products: ShopProduct[]) {
  await env.DB.batch([
    env.DB.prepare("DELETE FROM products"),
    ...products.map((p, i) =>
      env.DB.prepare("INSERT INTO products (id, slug, data, position, active) VALUES (?, ?, ?, ?, ?)")
        .bind(p.id, p.slug, JSON.stringify({ ...p, position: i }), i, p.active ? 1 : 0),
    ),
  ]);
}

export async function ensureShopMigrated() {
  await seedIfEmpty();
  await migrateShopDefaults();
}

export async function getShopCatalog(): Promise<ShopCatalog> {
  await ensureShopMigrated();
  const [categories, shapes, products, settings] = await Promise.all([
    getCategories(),
    getShapes(),
    getShopProducts(),
    getShopSettings(),
  ]);
  return { categories, shapes, products, settings };
}

export async function getOrders(): Promise<ShopOrder[]> {
  const rows = await env.DB.prepare("SELECT id, data, status, created_at FROM orders ORDER BY created_at DESC").all<{
    id: string;
    data: string;
    status: string;
    created_at: string;
  }>();
  return rows.results.map(r => {
    const order = parse<ShopOrder>(r.data);
    order.id = r.id;
    order.status = r.status as ShopOrder["status"];
    order.createdAt = r.created_at;
    return order;
  });
}

export async function getOrder(id: string): Promise<ShopOrder | null> {
  const row = await env.DB.prepare("SELECT id, data, status, created_at FROM orders WHERE id = ?").bind(id).first<{
    id: string;
    data: string;
    status: string;
    created_at: string;
  }>();
  if (!row) return null;
  const order = parse<ShopOrder>(row.data);
  order.id = row.id;
  order.status = row.status as ShopOrder["status"];
  order.createdAt = row.created_at;
  return order;
}

export async function saveOrder(order: ShopOrder) {
  await env.DB.prepare("INSERT INTO orders (id, data, status, created_at) VALUES (?, ?, ?, ?)")
    .bind(order.id, JSON.stringify(order), order.status, order.createdAt)
    .run();
}

export async function updateOrderStatus(id: string, status: ShopOrder["status"]) {
  const order = await getOrder(id);
  if (!order) return false;
  order.status = status;
  await env.DB.prepare("UPDATE orders SET data = ?, status = ? WHERE id = ?")
    .bind(JSON.stringify(order), status, id)
    .run();
  return true;
}

export { getShopSettings, saveShopSettings };
