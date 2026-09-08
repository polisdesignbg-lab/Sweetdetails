"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Package,
  Plus,
  Save,
  Shapes,
  ShoppingCart,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { adminFetch } from "@/lib/admin-client";
import type { ShopCategory, ShopOrder, ShopProduct, ShopShape } from "@/lib/shop/types";
import { ORDER_STATUS_LABELS, slugify } from "@/lib/shop/types";
import { DEFAULT_THEME_COLORS } from "@/lib/shop/types";
import type { ShopSettings } from "@/lib/shop/seed";

type SubTab = "products" | "categories" | "shapes" | "orders";
type ToastFn = (type: "ok" | "err", text: string) => void;

type Props = {
  notify: ToastFn;
  busy: boolean;
  setBusy: (v: boolean) => void;
};

export function ShopAdminPanel({ notify, busy, setBusy }: Props) {
  const [subTab, setSubTab] = useState<SubTab>("products");
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [shapes, setShapes] = useState<ShopShape[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [settings, setSettings] = useState<ShopSettings>({ minLeadDays: 7 });
  const [open, setOpen] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<ShopOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    const [shop, ord] = await Promise.all([
      adminFetch("/api/admin/shop").then(r => (r.ok ? r.json() : null)),
      adminFetch("/api/admin/orders").then(r => (r.ok ? r.json() : null)),
    ]);
    if (shop) {
      setCategories(shop.categories || []);
      setShapes(shop.shapes || []);
      setProducts(shop.products || []);
      setSettings(shop.settings || { minLeadDays: 7 });
    }
    if (ord?.orders) setOrders(ord.orders);
    setLoaded(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveShop = async (payload: Record<string, unknown>) => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/shop", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        notify("err", "Не успяхме да запазим промените.");
        return false;
      }
      notify("ok", "Запазено успешно.");
      return true;
    } catch {
      notify("err", "Грешка при запазване.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const saveProducts = () => saveShop({ products });
  const saveCategories = () => saveShop({ categories });
  const saveShapes = () => saveShop({ shapes });
  const saveSettings = () => saveShop({ settings });

  const updateOrderStatus = async (id: string, status: ShopOrder["status"]) => {
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!r.ok) {
        notify("err", "Не успяхме да обновим статуса.");
        return;
      }
      setOrders(orders.map(o => (o.id === id ? { ...o, status } : o)));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
      notify("ok", "Статусът е обновен.");
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<SubTab, string> = {
    products: "Продукти в магазина",
    categories: "Категории по повод",
    shapes: "Форми на бисквитки",
    orders: "Поръчки",
  };

  if (!loaded) {
    return <div className="admin-content"><p>Зареждане на магазина…</p></div>;
  }

  return (
    <>
      <div className="admin-subtabs">
        {([
          ["products", ShoppingCart, "Продукти"],
          ["categories", Tag, "Категории"],
          ["shapes", Shapes, "Форми"],
          ["orders", Package, "Поръчки"],
        ] as const).map(([key, Icon, label]) => (
          <button key={key} type="button" className={subTab === key ? "active" : ""} onClick={() => { setSubTab(key); setOpen(""); setSelectedOrder(null); }}>
            <Icon size={16} /> {label}
            {key === "orders" && orders.filter(o => o.status === "new").length > 0 && (
              <span className="admin-badge">{orders.filter(o => o.status === "new").length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="admin-content">
        <div className="admin-section-head">
          <div>
            <h2>{titles[subTab]}</h2>
            {subTab === "products" && <p>Управлявай дизайни, цени, снимки и SEO.</p>}
            {subTab === "categories" && <p>Категории по повод — показват се на /shop.</p>}
            {subTab === "shapes" && <p>Форми, които клиентът избира на продуктовата страница.</p>}
            {subTab === "orders" && <p>Всички заявени поръчки без онлайн плащане.</p>}
          </div>
          {subTab === "products" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const p: ShopProduct = {
                  id: crypto.randomUUID(),
                  slug: "nov-produkt",
                  title: "Нов продукт",
                  shortDescription: "",
                  description: "",
                  categoryId: categories[0]?.id || "",
                  images: [],
                  pricePerUnit: 2,
                  priceTiers: [],
                  minQuantity: 10,
                  quantityStep: 1,
                  shapeIds: shapes.filter(s => s.active).map(s => s.id),
                  themeColors: [...DEFAULT_THEME_COLORS],
                  sizeInfo: "Приблизително 6–7 см.",
                  packagingInfo: "",
                  productInfo: "",
                  featured: false,
                  active: true,
                  inStock: true,
                  isCustomDesign: false,
                  seoTitle: "",
                  seoDescription: "",
                  position: products.length,
                };
                setProducts([...products, p]);
                setOpen(p.id);
              }}>
                <Plus size={16} /> Нов продукт
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveProducts}>
                <Save size={16} /> Запази
              </button>
            </div>
          )}
          {subTab === "categories" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const c: ShopCategory = {
                  id: crypto.randomUUID(),
                  slug: "nova-kategoriya",
                  name: "Нова категория",
                  description: "",
                  image: "/shapes/circle.svg",
                  active: true,
                  position: categories.length,
                };
                setCategories([...categories, c]);
                setOpen(c.id);
              }}>
                <Plus size={16} /> Нова категория
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveCategories}>
                <Save size={16} /> Запази
              </button>
            </div>
          )}
          {subTab === "shapes" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const s: ShopShape = {
                  id: crypto.randomUUID(),
                  label: "Нова форма",
                  image: "/shapes/circle.svg",
                  addonPrice: 0,
                  active: true,
                  position: shapes.length,
                };
                setShapes([...shapes, s]);
                setOpen(s.id);
              }}>
                <Plus size={16} /> Нова форма
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveShapes}>
                <Save size={16} /> Запази
              </button>
            </div>
          )}
        </div>

        {subTab === "products" && products.map((p, i) => (
          <ShopProductEditor
            key={p.id}
            product={p}
            index={i}
            open={open === p.id}
            categories={categories}
            shapes={shapes}
            onToggle={() => setOpen(open === p.id ? "" : p.id)}
            onChange={patch => setProducts(products.map(x => (x.id === p.id ? { ...x, ...patch } : x)))}
            onDelete={() => setProducts(products.filter(x => x.id !== p.id))}
            onMove={(dir) => {
              const j = dir === "up" ? i - 1 : i + 1;
              if (j < 0 || j >= products.length) return;
              const next = [...products];
              [next[i], next[j]] = [next[j], next[i]];
              setProducts(next.map((x, k) => ({ ...x, position: k })));
            }}
            notify={notify}
          />
        ))}

        {subTab === "categories" && categories.map((c, i) => (
          <CategoryEditor
            key={c.id}
            category={c}
            index={i}
            open={open === c.id}
            onToggle={() => setOpen(open === c.id ? "" : c.id)}
            onChange={patch => setCategories(categories.map(x => (x.id === c.id ? { ...x, ...patch } : x)))}
            onDelete={() => setCategories(categories.filter(x => x.id !== c.id))}
            onMove={(dir) => {
              const j = dir === "up" ? i - 1 : i + 1;
              if (j < 0 || j >= categories.length) return;
              const next = [...categories];
              [next[i], next[j]] = [next[j], next[i]];
              setCategories(next.map((x, k) => ({ ...x, position: k })));
            }}
            notify={notify}
          />
        ))}

        {subTab === "shapes" && shapes.map((s, i) => (
          <ShapeEditor
            key={s.id}
            shape={s}
            index={i}
            open={open === s.id}
            onToggle={() => setOpen(open === s.id ? "" : s.id)}
            onChange={patch => setShapes(shapes.map(x => (x.id === s.id ? { ...x, ...patch } : x)))}
            onDelete={() => setShapes(shapes.filter(x => x.id !== s.id))}
            onMove={(dir) => {
              const j = dir === "up" ? i - 1 : i + 1;
              if (j < 0 || j >= shapes.length) return;
              const next = [...shapes];
              [next[i], next[j]] = [next[j], next[i]];
              setShapes(next.map((x, k) => ({ ...x, position: k })));
            }}
            notify={notify}
          />
        ))}

        {subTab === "orders" && (
          selectedOrder ? (
            <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} onStatus={updateOrderStatus} busy={busy} />
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Продукт</th>
                    <th>Кол.</th>
                    <th>Готов до</th>
                    <th>Сума</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="admin-table-click" onClick={() => setSelectedOrder(o)}>
                      <td>{o.id.slice(0, 8).toUpperCase()}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString("bg-BG")}</td>
                      <td>{o.contact.fullName}</td>
                      <td>{o.contact.phone}</td>
                      <td>{o.productTitle}</td>
                      <td>{o.quantity}</td>
                      <td>{o.customization.neededByDate || "—"}</td>
                      <td>{o.total.toFixed(2)} €</td>
                      <td><span className={`admin-status admin-status-${o.status}`}>{ORDER_STATUS_LABELS[o.status]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!orders.length && <p className="admin-empty">Няма поръчки все още.</p>}
            </div>
          )
        )}

        {subTab === "products" && (
          <div className="admin-card admin-card-body" style={{ marginTop: 16 }}>
            <h3>Настройки на магазина</h3>
            <label className="admin-field">
              Минимален срок (дни предварително)
              <input type="number" min={0} value={settings.minLeadDays} onChange={e => setSettings({ ...settings, minLeadDays: Number(e.target.value) || 0 })} />
            </label>
            <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveSettings}>
              <Save size={16} /> Запази настройки
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function AdminUpload({ onUrl, notify }: { onUrl: (url: string) => void; notify: ToastFn }) {
  const [uploading, setUploading] = useState(false);
  const upload = async (f: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        notify("err", "Качването не успя.");
        return;
      }
      onUrl(data.url);
      notify("ok", "Снимката е качена.");
    } catch {
      notify("err", "Грешка при качване.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <label className="admin-upload-zone admin-upload-inline">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
      {uploading ? <Upload size={20} /> : <ImagePlus size={20} />}
      <span>{uploading ? "Качване…" : "Качи"}</span>
    </label>
  );
}

function ShopProductEditor({
  product, index, open, categories, shapes, onToggle, onChange, onDelete, onMove, notify,
}: {
  product: ShopProduct;
  index: number;
  open: boolean;
  categories: ShopCategory[];
  shapes: ShopShape[];
  onToggle: () => void;
  onChange: (p: Partial<ShopProduct>) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
  notify: ToastFn;
}) {
  const cat = categories.find(c => c.id === product.categoryId);
  return (
    <div className="admin-card">
      <button className="admin-card-toggle" type="button" onClick={onToggle}>
        <span className="admin-card-index">{String(index + 1).padStart(2, "0")}</span>
        <div>
          <strong>{product.title}</strong>
          <small>{cat?.name || "—"} · {product.active ? "Активен" : "Скрыт"} · {product.featured ? "★ Featured" : ""}</small>
        </div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div className="admin-card-body">
          <div className="admin-grid">
            <label className="admin-field">Заглавие<input value={product.title} onChange={e => onChange({ title: e.target.value, slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">Slug<input value={product.slug} onChange={e => onChange({ slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">
              Категория
              <select value={product.categoryId} onChange={e => onChange({ categoryId: e.target.value })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="admin-field">Цена/бр. (€)<input type="number" step="0.01" value={product.pricePerUnit} onChange={e => onChange({ pricePerUnit: Number(e.target.value) })} /></label>
            <label className="admin-field">Мин. количество<input type="number" value={product.minQuantity} onChange={e => onChange({ minQuantity: Number(e.target.value) })} /></label>
            <label className="admin-field">Стъпка<input type="number" value={product.quantityStep} onChange={e => onChange({ quantityStep: Number(e.target.value) })} /></label>
            <label className="admin-field wide">Кратко описание<textarea value={product.shortDescription} onChange={e => onChange({ shortDescription: e.target.value })} /></label>
            <label className="admin-field wide">Подробно описание<textarea value={product.description} onChange={e => onChange({ description: e.target.value })} /></label>
            <label className="admin-field">Размер<textarea value={product.sizeInfo} onChange={e => onChange({ sizeInfo: e.target.value })} /></label>
            <label className="admin-field">Опаковка<textarea value={product.packagingInfo} onChange={e => onChange({ packagingInfo: e.target.value })} /></label>
            <label className="admin-field wide">За продукта<textarea value={product.productInfo} onChange={e => onChange({ productInfo: e.target.value })} /></label>
            <label className="admin-field">SEO title<input value={product.seoTitle} onChange={e => onChange({ seoTitle: e.target.value })} /></label>
            <label className="admin-field wide">SEO description<textarea value={product.seoDescription} onChange={e => onChange({ seoDescription: e.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={product.active} onChange={e => onChange({ active: e.target.checked })} /> Активен</label>
            <label className="admin-check"><input type="checkbox" checked={product.featured} onChange={e => onChange({ featured: e.target.checked })} /> Най-поръчван</label>
            <label className="admin-check"><input type="checkbox" checked={product.inStock} onChange={e => onChange({ inStock: e.target.checked })} /> В наличност</label>
            <label className="admin-check"><input type="checkbox" checked={product.isCustomDesign} onChange={e => onChange({ isCustomDesign: e.target.checked })} /> Индивидуален дизайн</label>
          </div>

          <div className="admin-block">
            <h3>Снимки</h3>
            <AdminUpload notify={notify} onUrl={url => onChange({ images: [...product.images, url] })} />
            <div className="admin-thumbs">
              {product.images.map(im => (
                <div key={im}>
                  <img src={im} alt="" />
                  <button type="button" aria-label="Премахни" onClick={() => onChange({ images: product.images.filter(x => x !== im) })}><Trash2 /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-block">
            <h3>Ценови диапазони</h3>
            <p className="admin-hint">Оставете празно за фиксирана цена на брой.</p>
            {(product.priceTiers.length ? product.priceTiers : [{ min: 10, max: 19, pricePerUnit: product.pricePerUnit }]).map((t, i) => (
              <div key={i} className="admin-tier-row">
                <input type="number" placeholder="Мин" value={t.min} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], min: Number(e.target.value) };
                  onChange({ priceTiers: tiers });
                }} />
                <input type="number" placeholder="Макс" value={t.max ?? ""} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], max: e.target.value ? Number(e.target.value) : undefined };
                  onChange({ priceTiers: tiers });
                }} />
                <input type="number" step="0.01" placeholder="€/бр" value={t.pricePerUnit} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], pricePerUnit: Number(e.target.value) };
                  onChange({ priceTiers: tiers });
                }} />
              </div>
            ))}
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onChange({ priceTiers: [...product.priceTiers, { min: 50, pricePerUnit: product.pricePerUnit }] })}>
              + Диапазон
            </button>
          </div>

          <div className="admin-block">
            <h3>Налични форми</h3>
            <div className="admin-check-grid">
              {shapes.map(s => (
                <label key={s.id} className="admin-check">
                  <input
                    type="checkbox"
                    checked={product.shapeIds.includes(s.id)}
                    onChange={e => onChange({
                      shapeIds: e.target.checked
                        ? [...product.shapeIds, s.id]
                        : product.shapeIds.filter(id => id !== s.id),
                    })}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>

          <div className="admin-card-actions">
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>↑</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>↓</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Изтрий</button>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryEditor({ category, index, open, onToggle, onChange, onDelete, onMove, notify }: {
  category: ShopCategory; index: number; open: boolean; onToggle: () => void;
  onChange: (p: Partial<ShopCategory>) => void; onDelete: () => void; onMove: (d: "up" | "down") => void; notify: ToastFn;
}) {
  return (
    <div className="admin-card">
      <button className="admin-card-toggle" type="button" onClick={onToggle}>
        <span className="admin-card-index">{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{category.name}</strong><small>/{category.slug}</small></div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div className="admin-card-body">
          <div className="admin-grid">
            <label className="admin-field">Име<input value={category.name} onChange={e => onChange({ name: e.target.value, slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">Slug<input value={category.slug} onChange={e => onChange({ slug: slugify(e.target.value) })} /></label>
            <label className="admin-field wide">Описание<textarea value={category.description} onChange={e => onChange({ description: e.target.value })} /></label>
            <label className="admin-field">SEO title<input value={category.seoTitle || ""} onChange={e => onChange({ seoTitle: e.target.value })} /></label>
            <label className="admin-field wide">SEO description<textarea value={category.seoDescription || ""} onChange={e => onChange({ seoDescription: e.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={category.active} onChange={e => onChange({ active: e.target.checked })} /> Активна</label>
          </div>
          <div className="admin-block">
            <h3>Изображение</h3>
            {category.image && <img src={category.image} alt="" className="admin-preview-thumb" />}
            <AdminUpload notify={notify} onUrl={url => onChange({ image: url })} />
          </div>
          <div className="admin-card-actions">
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>↑</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>↓</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Изтрий</button>
          </div>
        </div>
      )}
    </div>
  );
}

function ShapeEditor({ shape, index, open, onToggle, onChange, onDelete, onMove, notify }: {
  shape: ShopShape; index: number; open: boolean; onToggle: () => void;
  onChange: (p: Partial<ShopShape>) => void; onDelete: () => void; onMove: (d: "up" | "down") => void; notify: ToastFn;
}) {
  return (
    <div className="admin-card">
      <button className="admin-card-toggle" type="button" onClick={onToggle}>
        <span className="admin-card-index">{String(index + 1).padStart(2, "0")}</span>
        <div><strong>{shape.label}</strong><small>{shape.addonPrice > 0 ? `+${shape.addonPrice.toFixed(2)} €/бр` : "Без доплащане"}</small></div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div className="admin-card-body">
          <div className="admin-grid">
            <label className="admin-field">Име<input value={shape.label} onChange={e => onChange({ label: e.target.value })} /></label>
            <label className="admin-field">Доплащане (€/бр)<input type="number" step="0.01" value={shape.addonPrice} onChange={e => onChange({ addonPrice: Number(e.target.value) })} /></label>
            <label className="admin-check"><input type="checkbox" checked={shape.active} onChange={e => onChange({ active: e.target.checked })} /> Активна</label>
          </div>
          <div className="admin-block">
            <h3>Изображение / иконка</h3>
            {shape.image && <img src={shape.image} alt="" className="admin-preview-thumb" />}
            <AdminUpload notify={notify} onUrl={url => onChange({ image: url })} />
          </div>
          <div className="admin-card-actions">
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>↑</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>↓</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Изтрий</button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetail({ order, onBack, onStatus, busy }: {
  order: ShopOrder; onBack: () => void; onStatus: (id: string, s: ShopOrder["status"]) => void; busy: boolean;
}) {
  const c = order.customization;
  return (
    <div className="admin-card admin-card-body">
      <button type="button" className="admin-back-link" onClick={onBack}>← Назад към поръчките</button>
      <h2>Поръчка {order.id.slice(0, 8).toUpperCase()}</h2>
      <p><small>{new Date(order.createdAt).toLocaleString("bg-BG")}</small></p>

      <label className="admin-field">
        Статус
        <select value={order.status} disabled={busy} onChange={e => onStatus(order.id, e.target.value as ShopOrder["status"])}>
          {Object.entries(ORDER_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </label>

      <div className="admin-order-grid">
        <section>
          <h3>Клиент</h3>
          <p><strong>{order.contact.fullName}</strong></p>
          <p>{order.contact.phone}</p>
          <p>{order.contact.email}</p>
          <p>{order.contact.city}</p>
          {order.contact.deliveryNotes && <p>{order.contact.deliveryNotes}</p>}
        </section>
        <section>
          <h3>Продукт</h3>
          <p><strong>{order.productTitle}</strong></p>
          <p>Форма: {order.shapeLabel || "—"}</p>
          <p>Количество: {order.quantity} бр.</p>
          <p>Ед. цена: {order.unitPrice.toFixed(2)} €</p>
          <p><strong>Общо: {order.total.toFixed(2)} €</strong></p>
        </section>
        <section>
          <h3>Персонализация</h3>
          <dl className="admin-dl">
            <div><dt>Повод</dt><dd>{c.occasion || "—"}</dd></div>
            <div><dt>Надпис</dt><dd>{c.inscription || "—"}</dd></div>
            <div><dt>Име</dt><dd>{c.childName || "—"}</dd></div>
            <div><dt>Дата върху дизайна</dt><dd>{c.designDate || "—"}</dd></div>
            <div><dt>Цвят</dt><dd>{c.themeColor === "Друго" ? c.customColor || "Друго" : c.themeColor || "—"}</dd></div>
            <div><dt>Необходими до</dt><dd>{c.neededByDate || "—"}</dd></div>
            <div><dt>Бележки</dt><dd>{c.notes || "—"}</dd></div>
          </dl>
          {c.referenceImageUrl && (
            <p><a href={c.referenceImageUrl} target="_blank" rel="noopener noreferrer">Референтна снимка</a></p>
          )}
        </section>
      </div>
    </div>
  );
}
