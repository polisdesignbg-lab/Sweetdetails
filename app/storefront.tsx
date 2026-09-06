"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Baby, BriefcaseBusiness, CalendarHeart, Check, ChevronLeft, ChevronRight, Ellipsis, GraduationCap, Grid2X2, Heart, Home, Menu, Minus, Plus, Search, ShoppingBag, Truck, Upload, User, X } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/defaults";
import { SEO_FAQ } from "@/lib/seo";

type Props = { initial: { settings: SiteSettings; products: Product[] } };

const productImagePosition: Record<string, string> = {
  baptism: "18% 58%",
  birthday: "50% 58%",
  wedding: "82% 58%",
};

function ProductCard({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const [slide, setSlide] = useState(0);
  const images = product.images.length ? product.images : ["/products-showcase.png"];
  const objectPosition = productImagePosition[product.id] ?? "center";
  return (
    <article className="product-card">
      <div className="product-image">
        <Image
          src={images[slide]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 33vw, 33vw"
          unoptimized
          style={{ objectFit: "cover", objectPosition }}
        />
        {images.length > 1 && (
          <>
            <button className="slide prev" type="button" aria-label="Предишна" onClick={() => setSlide((slide - 1 + images.length) % images.length)}><ChevronLeft /></button>
            <button className="slide next" type="button" aria-label="Следваща" onClick={() => setSlide((slide + 1) % images.length)}><ChevronRight /></button>
          </>
        )}
      </div>
      <div className="product-copy">
        <h3>{product.title}</h3>
        <div className="price-row">
          <strong>{product.price.toFixed(2)} лв.</strong>
          <button type="button" aria-label={`Поръчай ${product.title}`} onClick={onOpen}><Heart /></button>
        </div>
      </div>
    </article>
  );
}

export default function Storefront({ initial }: Props) {
  const [content, setContent] = useState(initial);
  const { settings, products } = content;
  useEffect(() => {
    let active = true;
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(data => {
      if (active && data?.settings && Array.isArray(data?.products)) setContent(data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("Всички");
  const [selected, setSelected] = useState<Product | null>(null);
  const filtered = category === "Всички" ? products : products.filter(p => p.category === category);
  const scrollToProducts = (cat?: string) => {
    if (cat) setCategory(cat);
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="static-fallback" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <h1 className="seo-h1">Персонализирани бисквити и сладки за всеки празник — Sweet Details</h1>

      <div className="announcement">
        <span><Truck size={15} /> Безплатна доставка при поръчки над 80 лв.</span>
        <span><Heart size={15} fill="currentColor" /> {settings.announcement}</span>
      </div>

      <div className="header-zone">
        <header className="nav shop-nav">
          <button className="menu left-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>
            {menu ? <X /> : <Menu />}
          </button>
          <div className="nav-actions">
            <a href="#products" aria-label="Търсене"><Search /></a>
            <a href="#products" aria-label="Кошница" className="cart-icon"><ShoppingBag /><b>0</b></a>
          </div>
          <nav className={menu ? "open" : ""}>
            <a href="#top" onClick={() => setMenu(false)}>Начало</a>
            <a href="#products" onClick={() => setMenu(false)}>Бисквитки</a>
            <a href="#how" onClick={() => setMenu(false)}>Как се поръчва</a>
            <a href="#faq" onClick={() => setMenu(false)}>Въпроси</a>
            <a href="#contact" onClick={() => setMenu(false)}>Контакти</a>
          </nav>
        </header>
        <a href="#top" className="brand-logo floating-logo">
          <Image
            src="/sweet-details-logo.png"
            alt="Sweet Details — персонализирани бисквитки за всеки повод"
            width={320}
            height={214}
            unoptimized
            priority
          />
        </a>
      </div>

      <section id="top" className="hero">
        <div className="hero-banner-wrap">
          <Image
            src="/hero-banner.png"
            alt="Малките детайли правят големите моменти — персонализирани бисквитки Sweet Details"
            width={1024}
            height={528}
            unoptimized
            priority
            className="hero-banner-img"
          />
          <a href="#products" className="hero-cta-overlay" aria-label="Разгледай бисквитките">РАЗГЛЕДАЙ</a>
        </div>
        <div className="hero-dots" aria-hidden="true"><span className="active" /><span /><span /></div>
      </section>

      <section className="occasion-row" aria-label="Категории">
        {[["Кръщене", Baby], ["Рожден ден", CalendarHeart], ["Сватба", Heart], ["Завършване", GraduationCap], ["Фирмени", BriefcaseBusiness], ["Други", Ellipsis]].map(([c, I]) => {
          const Icon = I as typeof Baby;
          return (
            <button key={c as string} type="button" onClick={() => scrollToProducts(c as string)}>
              <span><Icon /></span>
              <strong>{c === "Фирмени" ? "Фирмени събития" : (c as string)}</strong>
            </button>
          );
        })}
      </section>

      <section id="products" className="section products">
        <div className="section-head favorites-title">
          <h2>Най-любими <Heart fill="currentColor" /></h2>
          <button type="button" onClick={() => setCategory("Всички")}>Виж всички <ArrowRight /></button>
        </div>
        <div className="grid">
          {filtered.map(p => <ProductCard product={p} key={p.id} onOpen={() => setSelected(p)} />)}
        </div>
        {!filtered.length && <div className="empty">Скоро ще добавим предложения в тази категория.</div>}
      </section>

      <section className="story-banner" aria-label="Промо">
        <div className="story-banner-inner">
          <span className="story-banner-icon" aria-hidden="true">🍪</span>
          <p>Бисквитки, които разказват вашата история! <Heart fill="currentColor" size={20} /></p>
        </div>
      </section>

      <section id="how" className="steps-compact">
        <h2>Как се поръчва?</h2>
        <div className="steps-grid">
          <div className="step-card"><span>1</span><h3>Избери бисквитки</h3><p>Посочи продукт, количество и повод.</p></div>
          <div className="step-card"><span>2</span><h3>Разкажи идеята</h3><p>Добави текст, цветове и примерна снимка.</p></div>
          <div className="step-card"><span>3</span><h3>Потвърди и плати</h3><p>Онлайн плащане и започваме изработката.</p></div>
        </div>
      </section>

      <section id="faq" className="seo-faq">
        <h2>Често задавани въпроси</h2>
        <div className="faq-list">
          {SEO_FAQ.map(item => (
            <details key={item.question} className="faq-item">
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <footer id="contact">
        <Image className="footer-logo-image" src="/sweet-details-logo.png" alt="Sweet Details" width={260} height={174} unoptimized />
        <p>Персонализирани бисквитки за всеки повод.</p>
        <div className="contact-lines">
          {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
          {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
        </div>
        <small>© {new Date().getFullYear()} {settings.brand}. Всички права запазени.</small>
      </footer>

      <nav className="mobile-bottom" aria-label="Мобилна навигация">
        <a href="#top" className="bottom-active"><Home />Начало</a>
        <a href="#products"><Grid2X2 />Категории</a>
        <a href="#products"><Heart />Любими</a>
        <a href="#contact"><User />Контакти</a>
      </nav>

      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}

function OrderModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const minimum = Math.max(10, product.minQuantity);
  const [quantity, setQuantity] = useState(minimum);
  const [values, setValues] = useState<Record<string, string | boolean>>({});
  const [file, setFile] = useState<File | null>(null);
  const [contact, setContact] = useState({ name: "", email: "", phone: "", date: "" });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const total = useMemo(() => {
    let extra = 0;
    product.options.forEach(o => {
      const v = values[o.id];
      const ch = o.choices?.find(c => c.label === v);
      extra += ch?.price || 0;
    });
    return (product.price + extra) * quantity;
  }, [values, quantity, product]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      let designUrl = "";
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const u = await fetch("/api/upload", { method: "POST", body: fd });
        if (u.ok) designUrl = (await u.json()).url;
      }
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ product, quantity, values, contact, designUrl, total }),
      });
      const data = await r.json();
      if (data.url) location.href = data.url;
      else setMessage(data.message || "Поръчката е приета.");
    } catch {
      setMessage("Не успяхме да изпратим поръчката. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <button className="modal-close" onClick={onClose} type="button"><X /></button>
        <div className="modal-head">
          <span className="section-label">Твоята поръчка</span>
          <h2>{product.title}</h2>
          <p>Попълни детайлите — ще ги видиш обобщени преди плащане.</p>
        </div>
        <form onSubmit={submit}>
          <div className="qty">
            <label>Количество <small>минимум {minimum} бр.</small></label>
            <div>
              <button type="button" onClick={() => setQuantity(Math.max(minimum, quantity - 1))}><Minus /></button>
              <strong>{quantity}</strong>
              <button type="button" onClick={() => setQuantity(quantity + 1)}><Plus /></button>
            </div>
          </div>
          {product.options.map(o => {
            if (o.dependsOn && !values[o.dependsOn]) return null;
            if (o.type === "checkbox") {
              return (
                <label className="check" key={o.id}>
                  <input type="checkbox" checked={!!values[o.id]} onChange={e => setValues({ ...values, [o.id]: e.target.checked })} />
                  <span><Check /></span>{o.label}
                </label>
              );
            }
            return (
              <label className="field" key={o.id}>
                {o.label}
                {o.type === "select" ? (
                  <select required={o.required} value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })}>
                    <option value="">Избери</option>
                    {o.choices?.map(c => <option key={c.label}>{c.label}</option>)}
                  </select>
                ) : o.type === "textarea" ? (
                  <textarea value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })} placeholder="Цветове, тема, стил…" />
                ) : (
                  <input required={o.required} value={String(values[o.id] || "")} onChange={e => setValues({ ...values, [o.id]: e.target.value })} />
                )}
              </label>
            );
          })}
          <label className="upload">
            <Upload />
            <span><strong>{file ? file.name : "Прикачи примерен дизайн"}</strong></span>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} />
          </label>
          <div className="contact-grid">
            <label className="field">Име<input required value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} /></label>
            <label className="field">Телефон<input required value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label>
            <label className="field">Имейл<input type="email" required value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
            <label className="field">Желана дата<input type="date" required value={contact.date} onChange={e => setContact({ ...contact, date: e.target.value })} /></label>
          </div>
          {message && <div className="form-message">{message}</div>}
          <div className="checkout">
            <div><small>Общо</small><strong>{total.toFixed(2)} лв.</strong></div>
            <button disabled={busy} type="submit">{busy ? "Обработваме…" : "Към плащане"}<ArrowRight /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
