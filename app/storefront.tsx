"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Baby,
  BriefcaseBusiness,
  CalendarHeart,
  Ellipsis,
  GraduationCap,
  Grid2X2,
  Heart,
  Home,
  Menu,
  Phone,
  Search,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import type { Product, SiteSettings } from "@/lib/defaults";
import { normalizeProduct } from "@/lib/defaults";
import { SEO_FAQ } from "@/lib/seo";
import { FREE_DELIVERY_EUR } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { OrderModal } from "@/components/order-modal";

type Props = { initial: { settings: SiteSettings; products: Product[] } };

export default function Storefront({ initial }: Props) {
  const [content, setContent] = useState(initial);
  const { settings, products } = content;
  useEffect(() => {
    let active = true;
    fetch("/api/content")
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!active || !data?.settings || !Array.isArray(data?.products)) return;
        setContent({
          settings: data.settings,
          products: data.products.map((p: Product) => normalizeProduct(p)),
        });
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const favorites = products.slice(0, 3);

  return (
    <main className="static-fallback" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <h1 className="seo-h1">Персонализирани бисквити и сладки за всеки празник — Sweet Details</h1>

      <div className="announcement">
        <span>
          <Truck size={14} /> Безплатна доставка при поръчки над {FREE_DELIVERY_EUR} €
        </span>
        <span>
          <Heart size={14} fill="currentColor" /> {settings.announcement}
        </span>
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
          <a href="/products" aria-label="Търсене">
            <Search size={26} strokeWidth={2} />
          </a>
          <a href="/products" aria-label="Кошница" className="cart-icon">
            <ShoppingBag size={26} strokeWidth={2} />
            <b>0</b>
          </a>
        </div>
        <nav className={menu ? "open" : ""}>
          <a href="#top" onClick={() => setMenu(false)}>
            Начало
          </a>
          <a href="/products" onClick={() => setMenu(false)}>
            Бисквитки
          </a>
          <a href="#how" onClick={() => setMenu(false)}>
            Как се поръчва
          </a>
          <a href="#faq" onClick={() => setMenu(false)}>
            Въпроси
          </a>
          <a href="#contact" onClick={() => setMenu(false)}>
            Контакти
          </a>
          <a href="/admin" onClick={() => setMenu(false)}>
            Админ панел
          </a>
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
          <a href="/products" className="hero-cta-overlay" aria-label="Разгледай бисквитките">
            РАЗГЛЕДАЙ
          </a>
        </div>
        <div className="hero-dots" aria-hidden="true">
          <span className="active" />
          <span />
          <span />
        </div>
        <a href="/products" className="hero-browse-link">
          Разгледай всички бисквитки <ArrowRight size={16} />
        </a>
      </section>

      <section className="occasion-row" aria-label="Категории">
        {(
          [
            ["Кръщене", Baby, "baptism"],
            ["Рожден ден", CalendarHeart, "birthday"],
            ["Сватба", Heart, "wedding"],
            ["Завършване", GraduationCap, "graduation"],
            ["Фирмени", BriefcaseBusiness, "corporate"],
            ["Други", Ellipsis, "other"],
          ] as const
        ).map(([c, I, slug]) => {
          const Icon = I;
          const href = `/products?category=${encodeURIComponent(c)}`;
          return (
            <a key={c} href={href} className={`cat-${slug}`}>
              <span>
                <Icon strokeWidth={2.25} />
              </span>
              <strong>{c === "Фирмени" ? "Фирмени събития" : c}</strong>
            </a>
          );
        })}
      </section>

      <section id="products" className="section products">
        <div className="section-head favorites-title">
          <h2>
            Най-любими <Heart fill="currentColor" />
          </h2>
          <a href="/products">
            Виж всички <ArrowRight />
          </a>
        </div>
        <div className="grid">
          {favorites.map(p => (
            <ProductCard product={p} key={p.id} onOpen={() => setSelected(p)} />
          ))}
        </div>
        {!favorites.length && <div className="empty">Скоро ще добавим предложения в тази категория.</div>}
      </section>

      <section className="story-banner" aria-label="Промо">
        <div className="story-banner-inner">
          <span className="story-banner-icon" aria-hidden="true">
            🍪
          </span>
          <p>
            Бисквитки, които разказват вашата история! <Heart fill="currentColor" size={20} />
          </p>
        </div>
      </section>

      <section id="how" className="steps-compact">
        <h2>Как се поръчва?</h2>
        <div className="steps-grid">
          <div className="step-card">
            <span>1</span>
            <h3>Избери бисквитки</h3>
            <p>Избери продукт, форма и количество — минимум 10 бр.</p>
          </div>
          <div className="step-card">
            <span>2</span>
            <h3>Опиши желанието</h3>
            <p>Добави текст и примерна снимка, ако имаш.</p>
          </div>
          <div className="step-card">
            <span>3</span>
            <h3>Изпрати поръчката</h3>
            <p>Само име, имейл и телефон — без регистрация. Ще се свържем с теб.</p>
          </div>
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
                <a href="/products">Бисквитки</a>
                <a href="#how">Как се поръчва</a>
                <a href="#about">За нас</a>
                <a href="#faq">Въпроси</a>
                <a href="/admin">Админ панел</a>
              </div>
            </div>
          </div>
          <div className="footer-meta">
            <small>
              © {new Date().getFullYear()} {settings.brand}
            </small>
            <span className="footer-meta-sep">·</span>
            <span className="footer-credit-inline">
              Направено от{" "}
              <a href="https://polisdesign.bg" target="_blank" rel="noopener noreferrer">
                Poli&apos;s Design
              </a>
            </span>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom" aria-label="Мобилна навигация">
        <a href="#top" className="bottom-active">
          <Home size={22} strokeWidth={2} />
          Начало
        </a>
        <a href="/products">
          <Grid2X2 size={22} strokeWidth={2} />
          Бисквитки
        </a>
        <a href="#how">
          <ShoppingBag size={22} strokeWidth={2} />
          Поръчка
        </a>
        <a href="#contact">
          <Phone size={22} strokeWidth={2} />
          Контакти
        </a>
      </nav>

      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
