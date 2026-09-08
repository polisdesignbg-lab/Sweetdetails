"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";
import { useCart } from "@/components/shop/cart-context";
import { defaultSettings, type SiteSettings } from "@/lib/defaults";
import { formatEuro } from "@/lib/format";
import type { OrderContact } from "@/lib/shop/types";

export default function CartPage() {
  const { items, total, count, removeItem, updateQuantity, clear } = useCart();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [contact, setContact] = useState<OrderContact>({
    fullName: "",
    email: "",
    phone: "",
    city: "",
    deliveryMethod: "econt_office",
    econtOffice: "",
    deliveryNotes: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/content").then(r => (r.ok ? r.json() : null)).then(d => d?.settings && setSettings(d.settings)).catch(() => {});
  }, []);

  const submit = async () => {
    const missing: string[] = [];
    if (!contact.fullName.trim()) missing.push("име");
    if (!contact.email.trim()) missing.push("имейл");
    if (!contact.phone.trim()) missing.push("телефон");
    if (!contact.econtOffice?.trim()) missing.push("офис на Еконт");
    if (missing.length) {
      setError(`Моля, попълни: ${missing.join(", ")}.`);
      return;
    }
    if (!items.length) {
      setError("Количката е празна.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/shop/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          cartItems: items,
          contact: { ...contact, deliveryMethod: "econt_office" },
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || "Грешка при изпращане.");
        return;
      }
      clear();
      location.href = data.redirectUrl || `/shop/thank-you?order=${data.orderId}`;
    } catch {
      setError("Не успяхме да изпратим поръчката. Опитай отново.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="static-fallback shop-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <ShopChrome settings={settings} activeNav="cart" />
      <section className="shop-hero shop-hero-compact">
        <a href="/shop" className="shop-back">← Магазин</a>
        <h1>Количка</h1>
        <p>{count ? `${count} продукта · ${formatEuro(total)}` : "Все още няма добавени продукти."}</p>
      </section>

      <section className="shop-section shop-cart-layout">
        {!items.length ? (
          <div className="shop-empty">
            <p>Количката е празна.</p>
            <a href="/shop" className="shop-btn-primary">Към магазина</a>
          </div>
        ) : (
          <>
            <div className="shop-cart-items">
              {items.map(item => (
                <article key={item.key} className="shop-cart-item">
                  <div className="shop-cart-item-image">
                    <Image src={item.image || "/products-showcase.png"} alt="" fill unoptimized style={{ objectFit: "cover" }} />
                  </div>
                  <div className="shop-cart-item-body">
                    <strong>{item.productTitle}</strong>
                    <p>
                      {item.shapeLabel ? `Форма: ${item.shapeLabel}` : ""}
                      {item.customization.childName ? ` · Име: ${item.customization.childName}` : ""}
                      {item.customization.neededByDate ? ` · Готови до: ${item.customization.neededByDate}` : ""}
                    </p>
                    <div className="shop-cart-item-actions">
                      <div className="qty-inline">
                        <button type="button" onClick={() => updateQuantity(item.key, item.quantity - item.quantityStep)}><Minus size={14} /></button>
                        <strong>{item.quantity}</strong>
                        <button type="button" onClick={() => updateQuantity(item.key, item.quantity + item.quantityStep)}><Plus size={14} /></button>
                      </div>
                      <span>{formatEuro(item.unitPrice * item.quantity)}</span>
                      <button type="button" className="shop-cart-remove" onClick={() => removeItem(item.key)} aria-label="Премахни"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="shop-cart-checkout">
              <h2>Поръчка като гост</h2>
              <p className="shop-cart-hint">Попълнете данните си. Доставката е до офис на Еконт — без онлайн плащане на този етап.</p>
              <div className="shop-fields">
                <label className="field">Име и фамилия *<input value={contact.fullName} onChange={e => setContact({ ...contact, fullName: e.target.value })} autoComplete="name" /></label>
                <label className="field">Телефон *<input type="tel" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" /></label>
                <label className="field">Имейл *<input type="email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} autoComplete="email" /></label>
                <label className="field">Населено място<input value={contact.city || ""} onChange={e => setContact({ ...contact, city: e.target.value })} placeholder="Напр. София" /></label>
                <label className="field wide">
                  Доставка до офис на Еконт *
                  <input
                    value={contact.econtOffice || ""}
                    onChange={e => setContact({ ...contact, econtOffice: e.target.value, deliveryMethod: "econt_office" })}
                    placeholder="Напишете името на офиса на Еконт"
                  />
                  <small>Без интеграция с Еконт — само посочете желания офис.</small>
                </label>
                <label className="field wide">Допълнителни бележки<textarea value={contact.deliveryNotes || ""} onChange={e => setContact({ ...contact, deliveryNotes: e.target.value })} placeholder="По желание…" /></label>
              </div>
              <div className="shop-order-total"><span>Общо</span><strong>{formatEuro(total)}</strong></div>
              {error && <div className="form-message err">{error}</div>}
              <button type="button" className="shop-btn-primary shop-btn-block" disabled={busy} onClick={submit}>
                {busy ? "Изпращаме…" : "Заяви поръчка"} <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </section>
      <ShopFooter settings={settings} />
    </main>
  );
}
