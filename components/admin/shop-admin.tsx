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
import { OrderDetail } from "@/components/admin/order-detail";

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
        notify("err", "ÐÐµ ÑƒÑÐ¿ÑÑ…Ð¼Ðµ Ð´Ð° Ð·Ð°Ð¿Ð°Ð·Ð¸Ð¼ Ð¿Ñ€Ð¾Ð¼ÐµÐ½Ð¸Ñ‚Ðµ.");
        return false;
      }
      notify("ok", "Ð—Ð°Ð¿Ð°Ð·ÐµÐ½Ð¾ ÑƒÑÐ¿ÐµÑˆÐ½Ð¾.");
      return true;
    } catch {
      notify("err", "Ð“Ñ€ÐµÑˆÐºÐ° Ð¿Ñ€Ð¸ Ð·Ð°Ð¿Ð°Ð·Ð²Ð°Ð½Ðµ.");
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
        notify("err", "ÐÐµ ÑƒÑÐ¿ÑÑ…Ð¼Ðµ Ð´Ð° Ð¾Ð±Ð½Ð¾Ð²Ð¸Ð¼ ÑÑ‚Ð°Ñ‚ÑƒÑÐ°.");
        return;
      }
      setOrders(orders.map(o => (o.id === id ? { ...o, status } : o)));
      if (selectedOrder?.id === id) setSelectedOrder({ ...selectedOrder, status });
      notify("ok", "Ð¡Ñ‚Ð°Ñ‚ÑƒÑÑŠÑ‚ Ðµ Ð¾Ð±Ð½Ð¾Ð²ÐµÐ½.");
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<SubTab, string> = {
    products: "ÐŸÑ€Ð¾Ð´ÑƒÐºÑ‚Ð¸ Ð² Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ð°",
    categories: "ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸ Ð¿Ð¾ Ð¿Ð¾Ð²Ð¾Ð´",
    shapes: "Ð¤Ð¾Ñ€Ð¼Ð¸ Ð½Ð° Ð±Ð¸ÑÐºÐ²Ð¸Ñ‚ÐºÐ¸",
    orders: "ÐŸÐ¾Ñ€ÑŠÑ‡ÐºÐ¸",
  };

  if (!loaded) {
    return <div className="admin-content"><p>Ð—Ð°Ñ€ÐµÐ¶Ð´Ð°Ð½Ðµ Ð½Ð° Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ð°â€¦</p></div>;
  }

  return (
    <>
      <div className="admin-subtabs">
        {([
          ["products", ShoppingCart, "ÐŸÑ€Ð¾Ð´ÑƒÐºÑ‚Ð¸"],
          ["categories", Tag, "ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸"],
          ["shapes", Shapes, "Ð¤Ð¾Ñ€Ð¼Ð¸"],
          ["orders", Package, "ÐŸÐ¾Ñ€ÑŠÑ‡ÐºÐ¸"],
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
            {subTab === "products" && <p>Ð£Ð¿Ñ€Ð°Ð²Ð»ÑÐ²Ð°Ð¹ Ð´Ð¸Ð·Ð°Ð¹Ð½Ð¸, Ñ†ÐµÐ½Ð¸, ÑÐ½Ð¸Ð¼ÐºÐ¸ Ð¸ SEO.</p>}
            {subTab === "categories" && <p>ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ð¸ Ð¿Ð¾ Ð¿Ð¾Ð²Ð¾Ð´ â€” Ð¿Ð¾ÐºÐ°Ð·Ð²Ð°Ñ‚ ÑÐµ Ð½Ð° /shop.</p>}
            {subTab === "shapes" && <p>Ð¤Ð¾Ñ€Ð¼Ð¸, ÐºÐ¾Ð¸Ñ‚Ð¾ ÐºÐ»Ð¸ÐµÐ½Ñ‚ÑŠÑ‚ Ð¸Ð·Ð±Ð¸Ñ€Ð° Ð½Ð° Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð¾Ð²Ð°Ñ‚Ð° ÑÑ‚Ñ€Ð°Ð½Ð¸Ñ†Ð°.</p>}
            {subTab === "orders" && <p>Ð’ÑÐ¸Ñ‡ÐºÐ¸ Ð·Ð°ÑÐ²ÐµÐ½Ð¸ Ð¿Ð¾Ñ€ÑŠÑ‡ÐºÐ¸ Ð±ÐµÐ· Ð¾Ð½Ð»Ð°Ð¹Ð½ Ð¿Ð»Ð°Ñ‰Ð°Ð½Ðµ.</p>}
          </div>
          {subTab === "products" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const p: ShopProduct = {
                  id: crypto.randomUUID(),
                  slug: "nov-produkt",
                  title: "ÐÐ¾Ð² Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚",
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
                  sizeInfo: "ÐŸÑ€Ð¸Ð±Ð»Ð¸Ð·Ð¸Ñ‚ÐµÐ»Ð½Ð¾ 6â€“7 ÑÐ¼.",
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
                <Plus size={16} /> ÐÐ¾Ð² Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveProducts}>
                <Save size={16} /> Ð—Ð°Ð¿Ð°Ð·Ð¸
              </button>
            </div>
          )}
          {subTab === "categories" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const c: ShopCategory = {
                  id: crypto.randomUUID(),
                  slug: "nova-kategoriya",
                  name: "ÐÐ¾Ð²Ð° ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ",
                  description: "",
                  image: "/shapes/circle.svg",
                  active: true,
                  position: categories.length,
                };
                setCategories([...categories, c]);
                setOpen(c.id);
              }}>
                <Plus size={16} /> ÐÐ¾Ð²Ð° ÐºÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveCategories}>
                <Save size={16} /> Ð—Ð°Ð¿Ð°Ð·Ð¸
              </button>
            </div>
          )}
          {subTab === "shapes" && (
            <div className="admin-inline-actions">
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={() => {
                const s: ShopShape = {
                  id: crypto.randomUUID(),
                  label: "ÐÐ¾Ð²Ð° Ñ„Ð¾Ñ€Ð¼Ð°",
                  image: "/shapes/circle.svg",
                  addonPrice: 0,
                  active: true,
                  position: shapes.length,
                };
                setShapes([...shapes, s]);
                setOpen(s.id);
              }}>
                <Plus size={16} /> ÐÐ¾Ð²Ð° Ñ„Ð¾Ñ€Ð¼Ð°
              </button>
              <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveShapes}>
                <Save size={16} /> Ð—Ð°Ð¿Ð°Ð·Ð¸
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
                    <th>â„–</th>
                    <th>Ð”Ð°Ñ‚Ð°</th>
                    <th>ÐšÐ»Ð¸ÐµÐ½Ñ‚</th>
                    <th>Ð¢ÐµÐ»ÐµÑ„Ð¾Ð½</th>
                    <th>ÐŸÑ€Ð¾Ð´ÑƒÐºÑ‚</th>
                    <th>ÐšÐ¾Ð».</th>
                    <th>Ð“Ð¾Ñ‚Ð¾Ð² Ð´Ð¾</th>
                    <th>Ð¡ÑƒÐ¼Ð°</th>
                    <th>Ð¡Ñ‚Ð°Ñ‚ÑƒÑ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id} className="admin-table-click" onClick={() => setSelectedOrder(o)}>
                      <td>{(o.id || "").slice(0, 8).toUpperCase() || "â€”"}</td>
                      <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString("bg-BG") : "â€”"}</td>
                      <td>{o.contact?.fullName || "â€”"}</td>
                      <td>{o.contact?.phone || "â€”"}</td>
                      <td>{o.productTitle || "â€”"}</td>
                      <td>{o.quantity ?? "â€”"}</td>
                      <td>{o.customization?.neededByDate || "â€”"}</td>
                      <td>{Number(o.total || 0).toFixed(2)} â‚¬</td>
                      <td><span className={`admin-status admin-status-${o.status}`}>{ORDER_STATUS_LABELS[o.status] || o.status || "â€”"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!orders.length && <p className="admin-empty">ÐÑÐ¼Ð° Ð¿Ð¾Ñ€ÑŠÑ‡ÐºÐ¸ Ð²ÑÐµ Ð¾Ñ‰Ðµ.</p>}
            </div>
          )
        )}

        {subTab === "products" && (
          <div className="admin-card admin-card-body" style={{ marginTop: 16 }}>
            <h3>ÐÐ°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸ Ð½Ð° Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ð°</h3>
            <label className="admin-field">
              ÐœÐ¸Ð½Ð¸Ð¼Ð°Ð»ÐµÐ½ ÑÑ€Ð¾Ðº (Ð´Ð½Ð¸ Ð¿Ñ€ÐµÐ´Ð²Ð°Ñ€Ð¸Ñ‚ÐµÐ»Ð½Ð¾)
              <input type="number" min={0} value={settings.minLeadDays} onChange={e => setSettings({ ...settings, minLeadDays: Number(e.target.value) || 0 })} />
            </label>
            <button className="admin-btn admin-btn-primary admin-btn-sm" disabled={busy} type="button" onClick={saveSettings}>
              <Save size={16} /> Ð—Ð°Ð¿Ð°Ð·Ð¸ Ð½Ð°ÑÑ‚Ñ€Ð¾Ð¹ÐºÐ¸
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
        notify("err", "ÐšÐ°Ñ‡Ð²Ð°Ð½ÐµÑ‚Ð¾ Ð½Ðµ ÑƒÑÐ¿Ñ.");
        return;
      }
      onUrl(data.url);
      notify("ok", "Ð¡Ð½Ð¸Ð¼ÐºÐ°Ñ‚Ð° Ðµ ÐºÐ°Ñ‡ÐµÐ½Ð°.");
    } catch {
      notify("err", "Ð“Ñ€ÐµÑˆÐºÐ° Ð¿Ñ€Ð¸ ÐºÐ°Ñ‡Ð²Ð°Ð½Ðµ.");
    } finally {
      setUploading(false);
    }
  };
  return (
    <label className="admin-upload-zone admin-upload-inline">
      <input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
      {uploading ? <Upload size={20} /> : <ImagePlus size={20} />}
      <span>{uploading ? "ÐšÐ°Ñ‡Ð²Ð°Ð½Ðµâ€¦" : "ÐšÐ°Ñ‡Ð¸"}</span>
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
          <small>{cat?.name || "â€”"} Â· {product.active ? "ÐÐºÑ‚Ð¸Ð²ÐµÐ½" : "Ð¡ÐºÑ€Ñ‹Ñ‚"} Â· {product.featured ? "â˜… Featured" : ""}</small>
        </div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div className="admin-card-body">
          <div className="admin-grid">
            <label className="admin-field">Ð—Ð°Ð³Ð»Ð°Ð²Ð¸Ðµ<input value={product.title} onChange={e => onChange({ title: e.target.value, slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">Slug<input value={product.slug} onChange={e => onChange({ slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">
              ÐšÐ°Ñ‚ÐµÐ³Ð¾Ñ€Ð¸Ñ
              <select value={product.categoryId} onChange={e => onChange({ categoryId: e.target.value })}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="admin-field">Ð¦ÐµÐ½Ð°/Ð±Ñ€. (â‚¬)<input type="number" step="0.01" value={product.pricePerUnit} onChange={e => onChange({ pricePerUnit: Number(e.target.value) })} /></label>
            <label className="admin-field">ÐœÐ¸Ð½. ÐºÐ¾Ð»Ð¸Ñ‡ÐµÑÑ‚Ð²Ð¾<input type="number" value={product.minQuantity} onChange={e => onChange({ minQuantity: Number(e.target.value) })} /></label>
            <label className="admin-field">Ð¡Ñ‚ÑŠÐ¿ÐºÐ°<input type="number" value={product.quantityStep} onChange={e => onChange({ quantityStep: Number(e.target.value) })} /></label>
            <label className="admin-field wide">ÐšÑ€Ð°Ñ‚ÐºÐ¾ Ð¾Ð¿Ð¸ÑÐ°Ð½Ð¸Ðµ<textarea value={product.shortDescription} onChange={e => onChange({ shortDescription: e.target.value })} /></label>
            <label className="admin-field wide">ÐŸÐ¾Ð´Ñ€Ð¾Ð±Ð½Ð¾ Ð¾Ð¿Ð¸ÑÐ°Ð½Ð¸Ðµ<textarea value={product.description} onChange={e => onChange({ description: e.target.value })} /></label>
            <label className="admin-field">Ð Ð°Ð·Ð¼ÐµÑ€<textarea value={product.sizeInfo} onChange={e => onChange({ sizeInfo: e.target.value })} /></label>
            <label className="admin-field">ÐžÐ¿Ð°ÐºÐ¾Ð²ÐºÐ°<textarea value={product.packagingInfo} onChange={e => onChange({ packagingInfo: e.target.value })} /></label>
            <label className="admin-field wide">Ð—Ð° Ð¿Ñ€Ð¾Ð´ÑƒÐºÑ‚Ð°<textarea value={product.productInfo} onChange={e => onChange({ productInfo: e.target.value })} /></label>
            <label className="admin-field">SEO title<input value={product.seoTitle} onChange={e => onChange({ seoTitle: e.target.value })} /></label>
            <label className="admin-field wide">SEO description<textarea value={product.seoDescription} onChange={e => onChange({ seoDescription: e.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={product.active} onChange={e => onChange({ active: e.target.checked })} /> ÐÐºÑ‚Ð¸Ð²ÐµÐ½</label>
            <label className="admin-check"><input type="checkbox" checked={product.featured} onChange={e => onChange({ featured: e.target.checked })} /> ÐÐ°Ð¹-Ð¿Ð¾Ñ€ÑŠÑ‡Ð²Ð°Ð½ (Ð½Ð°Ñ‡Ð°Ð»Ð½Ð° + Ð»ÐµÐ½Ñ‚Ð° Ð² Ð¼Ð°Ð³Ð°Ð·Ð¸Ð½Ð°)</label>
            <label className="admin-check"><input type="checkbox" checked={product.inStock} onChange={e => onChange({ inStock: e.target.checked })} /> Ð’ Ð½Ð°Ð»Ð¸Ñ‡Ð½Ð¾ÑÑ‚</label>
          </div>

          <div className="admin-block">
            <h3>Ð¡Ð½Ð¸Ð¼ÐºÐ¸</h3>
            <AdminUpload notify={notify} onUrl={url => onChange({ images: [...product.images, url] })} />
            <div className="admin-thumbs">
              {product.images.map(im => (
                <div key={im}>
                  <img src={im} alt="" />
                  <button type="button" aria-label="ÐŸÑ€ÐµÐ¼Ð°Ñ…Ð½Ð¸" onClick={() => onChange({ images: product.images.filter(x => x !== im) })}><Trash2 /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="admin-block">
            <h3>Ð¦ÐµÐ½Ð¾Ð²Ð¸ Ð´Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½Ð¸</h3>
            <p className="admin-hint">ÐžÑÑ‚Ð°Ð²ÐµÑ‚Ðµ Ð¿Ñ€Ð°Ð·Ð½Ð¾ Ð·Ð° Ñ„Ð¸ÐºÑÐ¸Ñ€Ð°Ð½Ð° Ñ†ÐµÐ½Ð° Ð½Ð° Ð±Ñ€Ð¾Ð¹.</p>
            {(product.priceTiers.length ? product.priceTiers : [{ min: 10, max: 19, pricePerUnit: product.pricePerUnit }]).map((t, i) => (
              <div key={i} className="admin-tier-row">
                <input type="number" placeholder="ÐœÐ¸Ð½" value={t.min} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], min: Number(e.target.value) };
                  onChange({ priceTiers: tiers });
                }} />
                <input type="number" placeholder="ÐœÐ°ÐºÑ" value={t.max ?? ""} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], max: e.target.value ? Number(e.target.value) : undefined };
                  onChange({ priceTiers: tiers });
                }} />
                <input type="number" step="0.01" placeholder="â‚¬/Ð±Ñ€" value={t.pricePerUnit} onChange={e => {
                  const tiers = [...product.priceTiers];
                  tiers[i] = { ...tiers[i], pricePerUnit: Number(e.target.value) };
                  onChange({ priceTiers: tiers });
                }} />
              </div>
            ))}
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onChange({ priceTiers: [...product.priceTiers, { min: 50, pricePerUnit: product.pricePerUnit }] })}>
              + Ð”Ð¸Ð°Ð¿Ð°Ð·Ð¾Ð½
            </button>
          </div>

          <div className="admin-block">
            <h3>ÐÐ°Ð»Ð¸Ñ‡Ð½Ð¸ Ñ„Ð¾Ñ€Ð¼Ð¸</h3>
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
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>â†‘</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>â†“</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Ð˜Ð·Ñ‚Ñ€Ð¸Ð¹</button>
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
            <label className="admin-field">Ð˜Ð¼Ðµ<input value={category.name} onChange={e => onChange({ name: e.target.value, slug: slugify(e.target.value) })} /></label>
            <label className="admin-field">Slug<input value={category.slug} onChange={e => onChange({ slug: slugify(e.target.value) })} /></label>
            <label className="admin-field wide">ÐžÐ¿Ð¸ÑÐ°Ð½Ð¸Ðµ<textarea value={category.description} onChange={e => onChange({ description: e.target.value })} /></label>
            <label className="admin-field">SEO title<input value={category.seoTitle || ""} onChange={e => onChange({ seoTitle: e.target.value })} /></label>
            <label className="admin-field wide">SEO description<textarea value={category.seoDescription || ""} onChange={e => onChange({ seoDescription: e.target.value })} /></label>
            <label className="admin-check"><input type="checkbox" checked={category.active} onChange={e => onChange({ active: e.target.checked })} /> ÐÐºÑ‚Ð¸Ð²Ð½Ð°</label>
          </div>
          <div className="admin-block">
            <h3>Ð˜Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ</h3>
            {category.image && <img src={category.image} alt="" className="admin-preview-thumb" />}
            <AdminUpload notify={notify} onUrl={url => onChange({ image: url })} />
          </div>
          <div className="admin-card-actions">
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>â†‘</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>â†“</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Ð˜Ð·Ñ‚Ñ€Ð¸Ð¹</button>
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
        <div><strong>{shape.label}</strong><small>{shape.addonPrice > 0 ? `+${shape.addonPrice.toFixed(2)} â‚¬/Ð±Ñ€` : "Ð‘ÐµÐ· Ð´Ð¾Ð¿Ð»Ð°Ñ‰Ð°Ð½Ðµ"}</small></div>
        {open ? <ChevronUp /> : <ChevronDown />}
      </button>
      {open && (
        <div className="admin-card-body">
          <div className="admin-grid">
            <label className="admin-field">Ð˜Ð¼Ðµ<input value={shape.label} onChange={e => onChange({ label: e.target.value })} /></label>
            <label className="admin-field">Ð”Ð¾Ð¿Ð»Ð°Ñ‰Ð°Ð½Ðµ (â‚¬/Ð±Ñ€)<input type="number" step="0.01" value={shape.addonPrice} onChange={e => onChange({ addonPrice: Number(e.target.value) })} /></label>
            <label className="admin-check"><input type="checkbox" checked={shape.active} onChange={e => onChange({ active: e.target.checked })} /> ÐÐºÑ‚Ð¸Ð²Ð½Ð°</label>
          </div>
          <div className="admin-block">
            <h3>Ð˜Ð·Ð¾Ð±Ñ€Ð°Ð¶ÐµÐ½Ð¸Ðµ / Ð¸ÐºÐ¾Ð½ÐºÐ°</h3>
            {shape.image && <img src={shape.image} alt="" className="admin-preview-thumb" />}
            <AdminUpload notify={notify} onUrl={url => onChange({ image: url })} />
          </div>
          <div className="admin-card-actions">
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("up")}>â†‘</button>
            <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onMove("down")}>â†“</button>
            <button type="button" className="admin-delete-row" onClick={onDelete}><Trash2 size={15} /> Ð˜Ð·Ñ‚Ñ€Ð¸Ð¹</button>
          </div>
        </div>
      )}
    </div>
  );
}
