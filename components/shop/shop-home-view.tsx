"use client";

import { useCatalog } from "./catalog-context";
import { CategoryCard, ShopProductCard } from "./product-card";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";
import { defaultSettings } from "@/lib/defaults";
import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/defaults";

export function ShopHomeView() {
  const catalog = useCatalog();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    fetch("/api/content").then(r => (r.ok ? r.json() : null)).then(d => d?.settings && setSettings(d.settings)).catch(() => {});
  }, []);

  const activeProducts = catalog.products.filter(p => p.active && !p.isCustomDesign);
  const featured = activeProducts.filter(p => p.featured);
  const regular = activeProducts.filter(p => !p.featured);
  const categories = catalog.categories.filter(c =>
    c.active && !c.slug.includes("individualen") && c.id !== "cat-custom",
  );

  return (
    <main className="static-fallback shop-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <ShopChrome settings={settings} activeNav="shop" />
      <section className="shop-hero">
        <span className="section-label">Магазин</span>
        <h1>Поръчай персонализирани бисквитки</h1>
        <p>Избери повод, дизайн и форма — ние ще изработим бисквитките с грижа за всеки детайл.</p>
      </section>

      <section className="shop-section">
        <h2>Избери по повод</h2>
        <div className="shop-category-grid">
          {categories.map(c => (
            <CategoryCard key={c.id} slug={c.slug} name={c.name} description={c.description} image={c.image} />
          ))}
        </div>
      </section>

      {!!featured.length && (
        <section className="shop-section">
          <h2>Най-поръчвани</h2>
          <div className="shop-featured-row">
            {featured.map(p => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="shop-section">
        <h2>Всички продукти</h2>
        <div className="shop-product-grid">
          {regular.map(p => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
        {!regular.length && (
          <p className="shop-empty">
            {featured.length
              ? "Останалите продукти ще се появят тук. Най-поръчваните са в лентата по-горе."
              : "Скоро ще добавим продукти."}
          </p>
        )}
      </section>

      <ShopFooter settings={settings} />
    </main>
  );
}
