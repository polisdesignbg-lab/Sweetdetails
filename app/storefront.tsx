"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, Baby, BriefcaseBusiness, CalendarHeart, Check, ChevronLeft, ChevronRight, Ellipsis, GraduationCap, Grid2X2, Heart, Home, Menu, Minus, Phone, Plus, Search, ShoppingBag, Truck, Upload, X } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/defaults";
import { SEO_FAQ } from "@/lib/seo";
import { formatEuro, FREE_DELIVERY_EUR } from "@/lib/format";

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
          <strong>{formatEuro(product.price)}</strong>
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
        <span><Truck size={14} /> Безплатна доставка при поръчки над {FREE_DELIVERY_EUR} €</span>
        <span><Heart size={14} fill="currentColor" /> {settings.announcement}</span>
      </div>

      <header className="header-zone shop-nav">
        <button className="menu left-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>
          {menu ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
        <a href="#top" className="brand-logo">
          <Image
            src="/sweet-details-logo.png"
            alt="Sweet Details — персонализирани бисквитки за всеки повод"
            width={240}
            height={160}
            unoptimized
            priority
          />
        </a>
        <div className="nav-actions">
          <a href="#products" aria-label="Търсене"><Search size={26} strokeWidth={2} /></a>
          <a href="#products" aria-label="Кошница" className="cart-icon"><ShoppingBag size={26} strokeWidth={2} /><b>0</b></a>
        </div>
        <nav className={menu ? "open" : ""}>
          <a href="#top" onClick={() => setMenu(false)}>Начало</a>
          <a href="#products" onClick={() => setMenu(false)}>Бисквитки</a>
          <a href="#how" onClick={() => setMenu(false)}>Как се поръчва</a>
          <a href="#faq" onClick={() => setMenu(false)}>Въпроси</a>
          <a href="#contact" onClick={() => setMenu(false)}>Контакти</a>
          <a href="/admin" onClick={() => setMenu(false)}>Админ панел</a>
        </nav>
      </header>

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
        {([
          ["Кръщене", Baby, "baptism"],
          ["Рожден ден", CalendarHeart, "birthday"],
          ["Сватба", Heart, "wedding"],
          ["Завършване", GraduationCap, "graduation"],
          ["Фирмени", BriefcaseBusiness, "corporate"],
          ["Други", Ellipsis, "other"],
        ] as const).map(([c, I, slug]) => {
          const Icon = I;
          return (
            <button key={c} type="button" className={`cat-${slug}`} onClick={() => scrollToProducts(c === "Фирмени" ? "Фирмени" : c)}>
              <span><Icon strokeWidth={2.25} /></span>
              <strong>{c === "Фирмени" ? "Фирмени събития" : c}</strong>
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
          <div className="step-card"><span>1</span><h3>Избери бисквитки</h3><p>Избери продукт и количество — минимум 10 бр.</p></div>
          <div className="step-card"><span>2</span><h3>Опиши желанието</h3><p>Добави повод, текст и примерна снимка, ако имаш.</p></div>
          <div className="step-card"><span>3</span><h3>Изпрати поръчката</h3><p>Само име, имейл и телефон — без регистрация. Ще се свържем с теб.</p></div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-copy">
            <span className="section-label">За Sweet Details</span>
            <h2>Ръчно изработени бисквитки с лично послание</h2>
            <p>{settings.about}</p>
          </div>
          <div className="info-cards">
            <article className="info-card">
              <Truck size={26} strokeWidth={2} />
              <strong>Безплатна доставка</strong>
              <p>При поръчки над {FREE_DELIVERY_EUR} € по цяла България.</p>
            </article>
            <article className="info-card">
              <CalendarHeart size={26} strokeWidth={2} />
              <strong>Срок за поръчка</strong>
              <p>{settings.leadDays}.</p>
            </article>
            <article className="info-card">
              <Heart size={26} strokeWidth={2} />
              <strong>Минимална поръчка</strong>
              <p>10 броя — персонализирани за твоя повод.</p>
            </article>
          </div>
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

      <footer id="contact" className="site-footer">
        <div className="footer-inner">
          <div className="footer-main">
            <div className="footer-brand">
              <Image className="footer-logo-image" src="/sweet-details-logo.png" alt="Sweet Details" width={140} height={56} unoptimized />
              <p>{settings.intro}</p>
            </div>
            <div className="footer-columns">
              <div className="footer-col">
                <h3>Контакти</h3>
                {settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}
                {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
              </div>
              <div className="footer-col">
                <h3>Навигация</h3>
                <a href="#products">Бисквитки</a>
                <a href="#how">Как се поръчва</a>
                <a href="#about">За нас</a>
                <a href="#faq">Въпроси</a>
                <a href="/admin">Админ панел</a>
              </div>
            </div>
          </div>
          <div className="footer-meta">
            <small>© {new Date().getFullYear()} {settings.brand}</small>
            <span className="footer-meta-sep">·</span>
            <span className="footer-credit-inline">
              Направено от <a href="https://polisdesign.bg" target="_blank" rel="noopener noreferrer">Poli&apos;s Design</a>
            </span>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom" aria-label="Мобилна навигация">
        <a href="#top" className="bottom-active"><Home size={22} strokeWidth={2} />Начало</a>
        <a href="#products"><Grid2X2 size={22} strokeWidth={2} />Бисквитки</a>
        <a href="#how"><ShoppingBag size={22} strokeWidth={2} />Поръчка</a>
        <a href="#contact"><Phone size={22} strokeWidth={2} />Контакти</a>
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
  const [contact, setContact] = useState({ name: "", email: "", phone: "" });
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
      else setMessage(data.message || "Поръчката е приета. Ще се свържем с теб скоро.");
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
          <p>Опиши детайлите и остави контакт — ще се свържем с теб за потвърждение.</p>
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
          <div className="contact-fields">
            <h3>Данни за връзка</h3>
            <p className="contact-hint">Без регистрация — нужни са само име, имейл и телефон.</p>
            <label className="field">Име<input required autoComplete="name" value={contact.name} onChange={e => setContact({ ...contact, name: e.target.value })} /></label>
            <label className="field">Имейл<input type="email" required autoComplete="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} /></label>
            <label className="field">Телефон<input type="tel" required autoComplete="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} /></label>
          </div>
          {message && <div className="form-message">{message}</div>}
          <div className="checkout">
            <div><small>Ориентировъчно</small><strong>{formatEuro(total)}</strong></div>
            <button disabled={busy} type="submit">{busy ? "Изпращаме…" : "Изпрати поръчка"}<ArrowRight /></button>
          </div>
        </form>
      </div>
    </div>
  );
}
