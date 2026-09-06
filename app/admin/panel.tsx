"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ImagePlus,
  LogOut,
  Plus,
  Save,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
} from "lucide-react";
import type { CookieShape, Product, ProductOption, SiteSettings } from "@/lib/defaults";
import { adminFetch, clearAdminToken, getStoredAdminToken, storeAdminToken } from "@/lib/admin-client";

type Props = {
  authorized: boolean;
  initial: { settings: SiteSettings; products: Product[] } | null;
};

type Toast = { type: "ok" | "err"; text: string };

export default function AdminPanel({ authorized, initial }: Props) {
  const [logged, setLogged] = useState(authorized);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<SiteSettings | undefined>(initial?.settings);
  const [products, setProducts] = useState<Product[]>(initial?.products ?? []);
  const [tab, setTab] = useState<"products" | "settings">("products");
  const [open, setOpen] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);

  const notify = useCallback((type: Toast["type"], text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const loadContent = useCallback(async () => {
    const data = await fetch("/api/content").then(r => (r.ok ? r.json() : null));
    if (data?.settings) setSettings(data.settings);
    if (Array.isArray(data?.products)) {
      setProducts(data.products.map((p: Product) => ({
        ...p,
        images: Array.isArray(p.images) ? p.images : [],
        options: Array.isArray(p.options) ? p.options : [],
        shapes: Array.isArray(p.shapes) ? p.shapes : [],
      })));
    }
  }, []);

  const restoreSession = useCallback(async () => {
    if (!getStoredAdminToken()) return false;
    const session = await adminFetch("/api/admin/session").then(r => (r.ok ? r.json() : null));
    if (!session?.ok) {
      clearAdminToken();
      return false;
    }
    await loadContent();
    setLogged(true);
    return true;
  }, [loadContent]);

  useEffect(() => {
    if (logged) return;
    restoreSession();
  }, [logged, restoreSession]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await adminFetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await r.json();
      if (!r.ok || !data.token) {
        setError("Грешна парола");
        return;
      }
      storeAdminToken(data.token);
      await loadContent();
      setLogged(true);
      notify("ok", "Успешен вход в админ панела.");
    } catch {
      setError("Не успяхме да влезем. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await adminFetch("/api/admin/logout", { method: "POST" });
    clearAdminToken();
    setLogged(false);
    setPassword("");
  };

  const save = async () => {
    if (!settings) return;
    setBusy(true);
    try {
      const r = await adminFetch("/api/admin/content", {
        method: "PUT",
        body: JSON.stringify({ settings, products }),
      });
      if (r.status === 401) {
        clearAdminToken();
        setLogged(false);
        notify("err", "Сесията изтече. Влез отново.");
        return;
      }
      if (!r.ok) {
        notify("err", "Не успяхме да запазим промените.");
        return;
      }
      notify("ok", "Промените са запазени успешно!");
    } catch {
      notify("err", "Грешка при запазване. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  if (!logged) {
    return (
      <div className="admin-login-wrap">
        <form className="admin-login-card" onSubmit={login}>
          <div className="admin-login-mark">SD</div>
          <h1>Админ панел</h1>
          <p>Управлявай продукти, цени и съдържание на сайта.</p>
          <p className="admin-url-hint">Адрес: <strong>/admin</strong></p>
          <label className="admin-field">
            Парола
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              required
            />
          </label>
          {error && <div className="admin-error">{error}</div>}
          <button className="admin-btn admin-btn-primary" disabled={busy} type="submit">
            {busy ? "Проверка…" : "Вход"}
          </button>
          <a className="admin-back-link" href="/"><ArrowLeft size={16} /> Към сайта</a>
        </form>
      </div>
    );
  }

  if (!settings) return null;

  const patchProduct = (id: string, patch: Partial<Product>) =>
    setProducts(products.map(p => (p.id === id ? { ...p, ...patch } : p)));

  const addProduct = () => {
    const p: Product = {
      id: crypto.randomUUID(),
      title: "Нов продукт",
      category: settings.categories[0] || "Други",
      description: "",
      price: 0,
      minQuantity: 10,
      images: [],
      options: [],
      shapes: [],
    };
    setProducts([...products, p]);
    setOpen(p.id);
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span>SD</span>
          <div>
            <strong>{settings.brand}</strong>
            <small>Администрация</small>
          </div>
        </div>
        <a className="admin-nav-link admin-nav-store" href="/" target="_blank" rel="noopener noreferrer">
          <Store size={18} />
          <span className="label">Онлайн магазин</span>
        </a>
        <button className={`admin-nav-btn ${tab === "products" ? "active" : ""}`} type="button" onClick={() => setTab("products")}>
          <ShoppingBag size={18} />
          <span className="label">Продукти</span>
        </button>
        <button className={`admin-nav-btn ${tab === "settings" ? "active" : ""}`} type="button" onClick={() => setTab("settings")}>
          <Settings size={18} />
          <span className="label">Настройки</span>
        </button>
        <button className="admin-nav-btn admin-nav-logout" type="button" onClick={logout}>
          <LogOut size={18} />
          <span className="label">Изход</span>
        </button>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Управление</span>
            <h1>{tab === "products" ? "Продукти" : "Настройки на сайта"}</h1>
          </div>
          <div className="admin-topbar-actions">
            <a className="admin-btn admin-btn-secondary admin-btn-sm" href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink size={16} />
              <span className="label">Преглед</span>
            </a>
            <button className="admin-btn admin-btn-primary admin-btn-sm admin-btn-save" disabled={busy} type="button" onClick={save}>
              <Save size={16} />
              <span className="label">{busy ? "Запазване…" : "Запази"}</span>
            </button>
          </div>
        </header>

        {toast && <div className={`admin-toast ${toast.type}`}>{toast.text}</div>}

        {tab === "products" ? (
          <div className="admin-content">
            <div className="admin-section-head">
              <div>
                <h2>Каталог</h2>
                <p>Добавяй продукти, снимки, цени и опции за персонализация.</p>
              </div>
              <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={addProduct}>
                <Plus size={16} /> Нов продукт
              </button>
            </div>

            {products.map((p, i) => (
              <div className="admin-card" key={p.id}>
                <button className="admin-card-toggle" type="button" onClick={() => setOpen(open === p.id ? "" : p.id)}>
                  <span className="admin-card-index">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{p.title}</strong>
                    <small>{p.category} · {p.price.toFixed(2)} € · мин. {p.minQuantity} бр.</small>
                  </div>
                  {open === p.id ? <ChevronUp /> : <ChevronDown />}
                </button>
                {open === p.id && (
                  <div className="admin-card-body">
                    <div className="admin-grid">
                      <Field label="Заглавие" value={p.title} onChange={v => patchProduct(p.id, { title: v })} />
                      <label className="admin-field">
                        Категория
                        <select value={p.category} onChange={e => patchProduct(p.id, { category: e.target.value })}>
                          {settings.categories.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </label>
                      <Field label="Цена (€)" type="number" value={String(p.price)} onChange={v => patchProduct(p.id, { price: Number(v) })} />
                      <Field label="Мин. количество" type="number" value={String(p.minQuantity)} onChange={v => patchProduct(p.id, { minQuantity: Number(v) })} />
                      <Field label="Етикет (по избор)" value={p.badge || ""} onChange={v => patchProduct(p.id, { badge: v })} />
                      <label className="admin-field wide">
                        Описание
                        <textarea value={p.description} onChange={e => patchProduct(p.id, { description: e.target.value })} />
                      </label>
                    </div>
                    <ImageEditor product={p} onNotify={notify} update={v => patchProduct(p.id, { images: v })} />
                    <ShapesEditor
                      shapes={p.shapes ?? []}
                      onNotify={notify}
                      update={v => patchProduct(p.id, { shapes: v })}
                    />
                    <OptionsEditor options={p.options} update={v => patchProduct(p.id, { options: v })} />
                    <button className="admin-delete-row" type="button" onClick={() => setProducts(products.filter(x => x.id !== p.id))}>
                      <Trash2 size={15} /> Изтрий продукта
                    </button>
                  </div>
                )}
              </div>
            ))}

            {!products.length && (
              <div className="admin-card admin-card-body" style={{ textAlign: "center", color: "#7a6270" }}>
                Няма продукти. Натисни „Нов продукт“.
              </div>
            )}
          </div>
        ) : (
          <SettingsEditor value={settings} update={setSettings} />
        )}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="admin-field">
      {label}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function ImageEditor({
  product,
  update,
  onNotify,
}: {
  product: Product;
  update: (v: string[]) => void;
  onNotify: (type: "ok" | "err", text: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  const upload = async (f: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const r = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        onNotify("err", data.error === "invalid file" ? "Невалиден файл (JPG, PNG или WebP до 8MB)." : "Качването не успя.");
        return;
      }
      update([...product.images, data.url]);
      onNotify("ok", "Снимката е качена.");
    } catch {
      onNotify("err", "Грешка при качване на снимка.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-block">
      <div className="admin-block-head">
        <div>
          <h3>Снимки</h3>
          <p>Първата снимка се показва в магазина.</p>
        </div>
      </div>
      <label className="admin-upload-zone">
        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => e.target.files?.[0] && upload(e.target.files[0])} />
        {uploading ? <Upload size={28} /> : <ImagePlus size={28} />}
        <strong>{uploading ? "Качване…" : "Качи снимка"}</strong>
        <span>JPG, PNG или WebP · до 8 MB</span>
      </label>
      {!!product.images.length && (
        <div className="admin-thumbs">
          {product.images.map(im => (
            <div key={im}>
              <img src={im} alt="" />
              <button type="button" aria-label="Премахни" onClick={() => update(product.images.filter(x => x !== im))}>
                <Trash2 />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ShapesEditor({
  shapes,
  update,
  onNotify,
}: {
  shapes: CookieShape[];
  update: (v: CookieShape[]) => void;
  onNotify: (type: "ok" | "err", text: string) => void;
}) {
  const [uploadingId, setUploadingId] = useState("");

  const patch = (id: string, patch: Partial<CookieShape>) =>
    update(shapes.map(s => (s.id === id ? { ...s, ...patch } : s)));

  const addShape = () =>
    update([...shapes, { id: crypto.randomUUID(), name: "Нова форма", image: "" }]);

  const upload = async (id: string, file: File) => {
    setUploadingId(id);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await adminFetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) {
        onNotify("err", data.error === "invalid file" ? "Невалиден файл (JPG, PNG или WebP до 8MB)." : "Качването не успя.");
        return;
      }
      patch(id, { image: data.url });
      onNotify("ok", "Снимката на формата е качена.");
    } catch {
      onNotify("err", "Грешка при качване на снимка.");
    } finally {
      setUploadingId("");
    }
  };

  return (
    <div className="admin-block">
      <div className="admin-block-head">
        <div>
          <h3>Форми на бисквитките</h3>
          <p>Добавяй само формите, подходящи за този повод. Клиентът избира при поръчка.</p>
        </div>
        <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" onClick={addShape}>
          <Plus size={14} /> Добави форма
        </button>
      </div>
      {!shapes.length && (
        <p className="admin-shapes-empty">Няма добавени форми. Добави например кръг, сърце, кръст…</p>
      )}
      <div className="admin-shapes-list">
        {shapes.map(shape => (
          <div className="admin-shape-row" key={shape.id}>
            <div className="admin-shape-preview">
              {shape.image ? <img src={shape.image} alt={shape.name} /> : <span>🍪</span>}
            </div>
            <div className="admin-shape-fields">
              <input
                value={shape.name}
                placeholder="Име на формата"
                onChange={e => patch(shape.id, { name: e.target.value })}
              />
              <label className="admin-shape-upload">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={e => e.target.files?.[0] && upload(shape.id, e.target.files[0])}
                />
                <ImagePlus size={14} />
                {uploadingId === shape.id ? "Качване…" : shape.image ? "Смени снимка" : "Качи снимка"}
              </label>
            </div>
            <button
              className="admin-btn admin-btn-ghost admin-btn-sm"
              type="button"
              aria-label="Изтрий форма"
              onClick={() => update(shapes.filter(s => s.id !== shape.id))}
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptionsEditor({ options, update }: { options: ProductOption[]; update: (v: ProductOption[]) => void }) {
  const patch = (i: number, v: Partial<ProductOption>) => update(options.map((o, x) => (x === i ? { ...o, ...v } : o)));

  return (
    <div className="admin-block">
      <div className="admin-block-head">
        <div>
          <h3>Опции за поръчка</h3>
          <p>Полета, които клиентът попълва при поръчка.</p>
        </div>
        <button
          className="admin-btn admin-btn-secondary admin-btn-sm"
          type="button"
          onClick={() => update([...options, { id: crypto.randomUUID(), label: "Нова опция", type: "text" }])}
        >
          <Plus size={14} /> Добави
        </button>
      </div>
      {options.map((o, i) => (
        <div className="admin-option-row" key={o.id}>
          <input value={o.label} placeholder="Етикет" onChange={e => patch(i, { label: e.target.value })} />
          <select value={o.type} onChange={e => patch(i, { type: e.target.value as ProductOption["type"] })}>
            <option value="text">Кратък текст</option>
            <option value="textarea">Дълъг текст</option>
            <option value="select">Избор</option>
            <option value="checkbox">Отметка</option>
          </select>
          {o.type === "select" ? (
            <input
              placeholder="Опции, разделени със запетая"
              value={o.choices?.map(c => c.label).join(", ") || ""}
              onChange={e => patch(i, { choices: e.target.value.split(",").map(x => ({ label: x.trim() })).filter(x => x.label) })}
            />
          ) : (
            <span />
          )}
          <label className="admin-check">
            <input type="checkbox" checked={!!o.required} onChange={e => patch(i, { required: e.target.checked })} />
            задълж.
          </label>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" type="button" onClick={() => update(options.filter((_, x) => x !== i))}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

function SettingsEditor({ value, update }: { value: SiteSettings; update: (v: SiteSettings) => void }) {
  const p = (k: keyof SiteSettings, v: string | string[]) => update({ ...value, [k]: v });

  return (
    <div className="admin-content">
      <div className="admin-section-head">
        <div>
          <h2>Съдържание и контакти</h2>
          <p>Текстове, които се виждат на сайта. Не забравяй да натиснеш „Запази“.</p>
        </div>
      </div>
      <div className="admin-card admin-card-body">
        <div className="admin-grid">
          <Field label="Име на бранда" value={value.brand} onChange={v => p("brand", v)} />
          <Field label="Съобщение най-горе" value={value.announcement} onChange={v => p("announcement", v)} />
          <label className="admin-field wide">
            Кратко представяне
            <textarea value={value.intro} onChange={e => p("intro", e.target.value)} />
          </label>
          <label className="admin-field wide">
            Текст „За нас“
            <textarea value={value.about} onChange={e => p("about", e.target.value)} />
          </label>
          <Field label="Срок за изработка" value={value.leadDays} onChange={v => p("leadDays", v)} />
          <label className="admin-field">
            Основен цвят
            <input type="color" value={value.primaryColor} onChange={e => p("primaryColor", e.target.value)} />
          </label>
          <Field label="Телефон" value={value.phone} onChange={v => p("phone", v)} />
          <Field label="Имейл" value={value.email} onChange={v => p("email", v)} />
          <Field label="Instagram" value={value.instagram} onChange={v => p("instagram", v)} />
          <Field label="Facebook" value={value.facebook} onChange={v => p("facebook", v)} />
          <label className="admin-field wide">
            Категории <small style={{ fontWeight: 400 }}>(разделени със запетая)</small>
            <input
              value={value.categories.join(", ")}
              onChange={e => p("categories", e.target.value.split(",").map(x => x.trim()).filter(Boolean))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
