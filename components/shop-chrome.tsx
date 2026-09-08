"use client";

import { useState } from "react";
import Image from "next/image";
import { Grid2X2, Heart, Home, Menu, Phone, Search, ShoppingBag, Truck, X } from "lucide-react";
import type { SiteSettings } from "@/lib/defaults";
import { FREE_DELIVERY_EUR } from "@/lib/format";

type Props = {
  settings: SiteSettings;
  activeNav?: "home" | "shop" | "products" | "order" | "contact";
};

export function ShopChrome({ settings, activeNav = "home" }: Props) {
  const [menu, setMenu] = useState(false);

  return (
    <>
      <div className="announcement">
        <span><Truck size={14} /> Безплатна доставка при поръчки над {FREE_DELIVERY_EUR} €</span>
        <span><Heart size={14} fill="currentColor" /> {settings.announcement}</span>
      </div>

      <header className="header-zone shop-nav">
        <button className="menu left-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>
          {menu ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
        <a href="/" className="brand-logo">
          <Image src="/sweet-details-logo.png" alt="Sweet Details" width={240} height={160} unoptimized priority />
        </a>
        <div className="nav-actions">
          <a href="/shop" className="nav-cta-shop">Поръчай бисквитки</a>
          <a href="/shop" aria-label="Търсене"><Search size={26} strokeWidth={2} /></a>
        </div>
        <nav className={menu ? "open" : ""}>
          <a href="/" onClick={() => setMenu(false)}>Начало</a>
          <a href="/shop" className="nav-cta-link" onClick={() => setMenu(false)}>Поръчай бисквитки</a>
          <a href="/shop" onClick={() => setMenu(false)}>Магазин</a>
          <a href="/#how" onClick={() => setMenu(false)}>Как се поръчва</a>
          <a href="/#faq" onClick={() => setMenu(false)}>Въпроси</a>
          <a href="/#contact" onClick={() => setMenu(false)}>Контакти</a>
          <a href="/admin" onClick={() => setMenu(false)}>Админ</a>
        </nav>
      </header>

      <nav className="mobile-bottom" aria-label="Мобилна навигация">
        <a href="/" className={activeNav === "home" ? "bottom-active" : ""}><Home size={22} strokeWidth={2} />Начало</a>
        <a href="/shop" className={activeNav === "shop" || activeNav === "products" ? "bottom-active" : ""}><Grid2X2 size={22} strokeWidth={2} />Магазин</a>
        <a href="/shop" className={activeNav === "order" ? "bottom-active" : ""}><ShoppingBag size={22} strokeWidth={2} />Поръчка</a>
        <a href="/#contact" className={activeNav === "contact" ? "bottom-active" : ""}><Phone size={22} strokeWidth={2} />Контакти</a>
      </nav>
    </>
  );
}

export function ShopFooter({ settings }: { settings: SiteSettings }) {
  return (
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
              <a href="/shop">Поръчай бисквитки</a>
              <a href="/#how">Как се поръчва</a>
              <a href="/#about">За нас</a>
              <a href="/admin">Админ</a>
            </div>
          </div>
        </div>
        <div className="footer-meta">
          <small>© {new Date().getFullYear()} {settings.brand}</small>
          <span className="footer-meta-sep">·</span>
          <span className="footer-credit-inline">Направено от <a href="https://polisdesign.bg" target="_blank" rel="noopener noreferrer">Poli&apos;s Design</a></span>
        </div>
      </div>
    </footer>
  );
}
