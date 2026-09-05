import { env } from "cloudflare:workers";
import { defaultProducts, defaultSettings, type Product, type SiteSettings } from "./defaults";

export async function getContent(): Promise<{settings: SiteSettings; products: Product[]}> {
  try {
    const setting = await env.DB.prepare("SELECT data FROM settings WHERE id = 1").first<{data:string}>();
    const rows = await env.DB.prepare("SELECT data FROM products ORDER BY position ASC").all<{data:string}>();
    return {
      settings: setting ? {...defaultSettings, ...JSON.parse(setting.data)} : defaultSettings,
      products: rows.results.length ? rows.results.map((r) => JSON.parse(r.data)) : defaultProducts,
    };
  } catch {
    return { settings: defaultSettings, products: defaultProducts };
  }
}

export async function saveContent(settings: SiteSettings, products: Product[]) {
  await env.DB.prepare("INSERT INTO settings (id,data) VALUES (1,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data").bind(JSON.stringify(settings)).run();
  const statements = [env.DB.prepare("DELETE FROM products"), ...products.map((p, i) => env.DB.prepare("INSERT INTO products (id,data,position) VALUES (?,?,?)").bind(p.id, JSON.stringify(p), i))];
  await env.DB.batch(statements);
}
