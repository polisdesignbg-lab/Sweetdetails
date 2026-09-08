"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarClock, Menu, ShoppingCart, Truck, X } from "lucide-react";
import type { SiteSettings } from "@/lib/defaults";
import { FREE_DELIVERY_EUR } from "@/lib/format";
import { useCart } from "@/components/shop/cart-context";

type Props = {
  settings: SiteSettings;
  activeNav?: "home" | "shop" | "products" | "order" | "contact" | "cart";
};

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5h2.5V5.2c-.4-.1-1.8-.2-3.4-.2-3.4 0-5.7 2-5.7 5.7V13H5v3.8h2.4V24h3.8v-7.2H14l.6-3.8h-3.2v-2.1c0-1.1.3-1.9 1.6-1.9z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ShopChrome({ settings }: Props) {
  const [menu, setMenu] = useState(false);
  const { count } = useCart();

  return (
    <>
      <div className="announcement">
        <span><CalendarClock size={14} /> Поръчки се приемат 2–3 седмици предварително</span>
        <span className="announcement-secondary"><Truck size={14} /> Безплатна доставка при поръчки над {FREE_DELIVERY_EUR} €</span>
      </div>

      <header className="header-zone shop-nav">
        <button className="menu left-menu" type="button" onClick={() => setMenu(!menu)} aria-label="Меню" aria-expanded={menu}>
          {menu ? <X size={26} strokeWidth={2} /> : <Menu size={26} strokeWidth={2} />}
        </button>
        <a href="/" className="brand-logo">
          <Image src="/sweet-details-logo.png" alt="Sweet Details" width={260} height={72} unoptimized priority />
        </a>
        <div className="nav-actions">
          <a href="/shop/cart" className="nav-cart" aria-label={`Количка${count ? `, ${count} продукта` : ""}`}>
            <ShoppingCart size={26} strokeWidth={2} />
            {count > 0 && <span className="nav-cart-badge">{count > 99 ? "99+" : count}</span>}
          </a>
        </div>
        <nav className={menu ? "open" : ""}>
          <a href="/" onClick={() => setMenu(false)}>Начало</a>
          <a href="/shop" onClick={() => setMenu(false)}>Магазин</a>
          <a href="/shop/cart" onClick={() => setMenu(false)}>Количка{count > 0 ? ` (${count})` : ""}</a>
          <a href="/#how" onClick={() => setMenu(false)}>Как се поръчва</a>
          <a href="/#faq" onClick={() => setMenu(false)}>Въпроси</a>
          <a href="/#contact" onClick={() => setMenu(false)}>Контакти</a>
        </nav>
      </header>
    </>
  );
}

function socialHref(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function ShopFooter({ settings }: { settings: SiteSettings }) {
  const email = (settings.email || "").trim();
  const ig = socialHref(settings.instagram || "");
  const fb = socialHref(settings.facebook || "");

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
              {email ? (
                <a href={`mailto:${email}`}>{email}</a>
              ) : (
                <a href="mailto:sweetdetails.bg@gmail.com">sweetdetails.bg@gmail.com</a>
              )}
              {settings.phone && <a href={`tel:${settings.phone}`}>{settings.phone}</a>}
              <div className="footer-socials">
                {fb ? (
                  <a href={fb} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-link">
                    <FacebookIcon />
                  </a>
                ) : (
                  <span className="footer-social-link footer-social-link-muted" title="Добави Facebook линк от админ → Настройки" aria-label="Facebook">
                    <FacebookIcon />
                  </span>
                )}
                {ig ? (
                  <a href={ig} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-link">
                    <InstagramIcon />
                  </a>
                ) : (
                  <span className="footer-social-link footer-social-link-muted" title="Добави Instagram линк от админ → Настройки" aria-label="Instagram">
                    <InstagramIcon />
                  </span>
                )}
              </div>
            </div>
            <div className="footer-col">
              <h3>Навигация</h3>
              <a href="/shop">Магазин</a>
              <a href="/shop/cart">Количка</a>
              <a href="/#how">Как се поръчва</a>
              <a href="/#about">За нас</a>
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
