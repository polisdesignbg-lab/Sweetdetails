import { env } from "cloudflare:workers";
import { defaultProducts, defaultSettings, defaultShapesByProductId, type Product, type ProductOption, type SiteSettings } from "./defaults";

function normalizeOptions(raw: ProductOption[] | undefined, productId: string): ProductOption[] {
  const fallback = defaultProducts.find(p => p.id === productId)?.options ?? [];
  const source = Array.isArray(raw) && raw.length ? raw : fallback;
  const merged = source.map(o => ({
    ...o,
    required: o.id === "occasion" ? true : o.id === "printText" || o.id === "brief" ? false : o.required,
  }));
  for (const opt of fallback) {
    if (!merged.some(o => o.id === opt.id)) merged.push(opt);
  }
  return merged;
}

type RawProduct = Product & {
  pricePerUnit?: number;
  shortDescription?: string;
  categoryId?: string;
  slug?: string;
  featured?: boolean;
};

function normalizeProduct(raw: RawProduct): Product {
  const price = typeof raw.price === "number"
    ? raw.price
    : typeof raw.pricePerUnit === "number"
      ? raw.pricePerUnit
      : 2;

  const shapes = Array.isArray(raw.shapes) && raw.shapes.length
    ? raw.shapes
    : (defaultShapesByProductId[raw.id] ?? []);

  return {
    id: raw.id,
    title: raw.title || "Продукт",
    category: raw.category || "Други",
    description: raw.description || raw.shortDescription || "",
    price,
    minQuantity: typeof raw.minQuantity === "number" ? raw.minQuantity : 10,
    images: Array.isArray(raw.images) && raw.images.length ? raw.images : ["/products-showcase.png"],
    shapes,
    badge: raw.badge || (raw.featured ? "Най-любими" : undefined),
    options: normalizeOptions(raw.options, raw.id),
  };
}

function parseProductRow(data: string): Product | null {
  try {
    const raw = JSON.parse(data) as RawProduct;
    if (!raw?.id || !raw?.title) return null;
    return normalizeProduct(raw);
  } catch {
    return null;
  }
}

export async function getContent(): Promise<{ settings: SiteSettings; products: Product[] }> {
  try {
    const setting = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first<{ data: string }>();
    const rows = await env.DB.prepare("SELECT data FROM products ORDER BY position ASC").all<{ data: string }>();
    const settingsData = setting ? (JSON.parse(setting.data) as Record<string, unknown>) : {};
    // Keep site settings only — ignore nested shop_settings blob fields
    const settings: SiteSettings = {
      ...defaultSettings,
      brand: String(settingsData.brand ?? defaultSettings.brand),
      headline: String(settingsData.headline ?? defaultSettings.headline),
      intro: String(settingsData.intro ?? defaultSettings.intro),
      announcement: String(settingsData.announcement ?? defaultSettings.announcement),
      about: String(settingsData.about ?? defaultSettings.about),
      leadDays: String(settingsData.leadDays ?? defaultSettings.leadDays),
      primaryColor: String(settingsData.primaryColor ?? defaultSettings.primaryColor),
      instagram: String(settingsData.instagram ?? ""),
      facebook: String(settingsData.facebook ?? ""),
      tiktok: String(settingsData.tiktok ?? ""),
      email: String(settingsData.email ?? defaultSettings.email),
      phone: String(settingsData.phone ?? ""),
      categories: Array.isArray(settingsData.categories)
        ? (settingsData.categories as string[])
        : defaultSettings.categories,
    };

    const products = rows.results
      .map(r => parseProductRow(r.data))
      .filter((p): p is Product => p !== null);

    return {
      settings,
      products: products.length ? products : defaultProducts,
    };
  } catch {
    return { settings: defaultSettings, products: defaultProducts };
  }
}

export async function saveContent(settings: SiteSettings, products: Product[]) {
  const existing = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first<{ data: string }>();
  const data = existing ? (JSON.parse(existing.data) as Record<string, unknown>) : {};
  Object.assign(data, settings);
  await env.DB.prepare("INSERT INTO settings (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data")
    .bind(JSON.stringify(data))
    .run();
  // Do not wipe shop catalog products from homepage admin save.
  // Homepage favorites use normalized shop/legacy products from the same table.
  const statements = [
    env.DB.prepare("DELETE FROM products"),
    ...products.map((p, i) =>
      env.DB.prepare("INSERT INTO products (id, slug, data, position, active) VALUES (?, ?, ?, ?, ?)")
        .bind(p.id, p.id, JSON.stringify(p), i, 1),
    ),
  ];
  await env.DB.batch(statements);
}
