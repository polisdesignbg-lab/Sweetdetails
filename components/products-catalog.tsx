"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
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
  X,
} from "lucide-react";
import type { Product, SiteSettings } from "@/lib/defaults";
import { normalizeProduct } from "@/lib/defaults";
import { FREE_DELIVERY_EUR } from "@/lib/format";
import { ProductCard } from "@/components/product-card";
import { OrderModal } from "@/components/order-modal";

type Props = { initial: { settings: SiteSettings; products: Product[] } };

const OCCASIONS = [
  ["Всички", null, "all"],
  ["Кръщене", Baby, "baptism"],
  ["Рожден ден", CalendarHeart, "birthday"],
  ["Сватба", Heart, "wedding"],
  ["Завършване", GraduationCap, "graduation"],
  ["Фирмени", BriefcaseBusiness, "corporate"],
  ["Други", Ellipsis, "other"],
] as const;

export default function ProductsCatalog({ initial }: Props) {
  const [content, setContent] = useState(initial);
  const { settings, products } = content;
  const [menu, setMenu] = useState(false);
  const [category, setCategory] = useState("Всички");
  const [selected, setSelected] = useState<Product | null>(null);

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (cat) setCategory(cat === "Фирмени събития" ? "Фирмени" : cat);
  }, []);

  const filtered = useMemo(
    () => (category === "Всички" ? products : products.filter(p => p.category === category)),
    [products, category],
  );

  return (
    <main className="static-fallback products-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <h1 className="seo-h1">Всички персонализирани бисквитки — Sweet Details</h1>

      <div className="announcement">
        <span>Безплатна доставка при поръчки над {FREE_DELIVERY_EUR} €</span>
        <span>
          <Heart size={14} fill="currentColor" /> {settings.announcement}
        </span>
      </div>

      <header className="header-zone shop-nav">
        <button className="menu left-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>
          {menu ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
        <a href="/" className="brand-logo">
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
          <a href="/" onClick={() => setMenu(false)}>
            Начало
          </a>
          <a href="/products" onClick={() => setMenu(false)}>
            Бисквитки
          </a>
          <a href="/#how" onClick={() => setMenu(false)}>
            Как се поръчва
          </a>
          <a href="/#faq" onClick={() => setMenu(false)}>
            Въпроси
          </a>
          <a href="/#contact" onClick={() => setMenu(false)}>
            Контакти
          </a>
          <a href="/admin" onClick={() => setMenu(false)}>
            Админ панел
          </a>
        </nav>
      </header>

      <section className="catalog-hero">
        <span className="section-label">Каталог</span>
        <h2>Бисквитки за всеки повод</h2>
        <p>Избери повод, разгледай подходящите бисквитки и при поръчка посочи желаната форма.</p>
      </section>

      <section className="catalog-filters" aria-label="Филтър по повод">
        {OCCASIONS.map(([label, Icon, slug]) => {
          const active = category === label;
          return (
            <button
              key={label}
              type="button"
              className={`catalog-filter cat-${slug}${active ? " active" : ""}`}
              onClick={() => setCategory(label)}
            >
              {Icon ? (
                <span>
                  <Icon strokeWidth={2.25} />
                </span>
              ) : (
                <span className="catalog-filter-all">
                  <Grid2X2 strokeWidth={2.25} />
                </span>
              )}
              <strong>{label === "Фирмени" ? "Фирмени" : label}</strong>
            </button>
          );
        })}
      </section>

      <section className="section products catalog-grid-section">
        <div className="section-head favorites-title">
          <h2>
            {category === "Всички" ? "Всички бисквитки" : category} <Heart fill="currentColor" />
          </h2>
          <span className="catalog-count">{filtered.length} продукта</span>
        </div>
        <div className="grid catalog-grid">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} showDescription onOpen={() => setSelected(p)} />
          ))}
        </div>
        {!filtered.length && <div className="empty">Скоро ще добавим предложения в тази категория.</div>}
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
                <a href="/">Начало</a>
                <a href="/products">Бисквитки</a>
                <a href="/#how">Как се поръчва</a>
                <a href="/admin">Админ панел</a>
              </div>
            </div>
          </div>
          <div className="footer-meta">
            <small>
              © {new Date().getFullYear()} {settings.brand}
            </small>
          </div>
        </div>
      </footer>

      <nav className="mobile-bottom" aria-label="Мобилна навигация">
        <a href="/">
          <Home size={22} strokeWidth={2} />
          Начало
        </a>
        <a href="/products" className="bottom-active">
          <Grid2X2 size={22} strokeWidth={2} />
          Бисквитки
        </a>
        <a href="/#how">
          <ShoppingBag size={22} strokeWidth={2} />
          Поръчка
        </a>
        <a href="/#contact">
          <Phone size={22} strokeWidth={2} />
          Контакти
        </a>
      </nav>

      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
