"use client";

import { useEffect, useState } from "react";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";
import { defaultSettings } from "@/lib/defaults";
import type { SiteSettings } from "@/lib/defaults";

export default function ThankYouPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(d => d?.settings && setSettings(d.settings)).catch(() => {});
    const id = new URLSearchParams(location.search).get("order");
    if (id) setOrderNumber(id.slice(0, 8).toUpperCase());
  }, []);

  return (
    <main className="static-fallback shop-page">
      <ShopChrome settings={settings} activeNav="shop" />
      <section className="shop-thank-you">
        <h1>Благодарим за поръчката!</h1>
        {orderNumber && <p className="shop-order-num">Номер: <strong>{orderNumber}</strong></p>}
        <p>Поръчката ви е получена успешно. Ще се свържем с вас скоро за потвърждение и уточняване на детайлите.</p>
        <a href="/shop" className="shop-btn-primary">Към магазина</a>
        <a href="/" className="shop-back">← Начало</a>
      </section>
      <ShopFooter settings={settings} />
    </main>
  );
}
