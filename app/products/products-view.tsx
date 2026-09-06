"use client";

import { useEffect, useMemo, useState } from "react";
import type { Product, SiteSettings } from "@/lib/defaults";
import { ProductCard, OrderModal } from "@/components/shop-ui";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";

type Props = {
  initial: { settings: SiteSettings; products: Product[] };
  initialCategory?: string;
};

export default function ProductsView({ initial, initialCategory = "Всички" }: Props) {
  const [content, setContent] = useState(initial);
  const { settings, products } = content;
  const [category, setCategory] = useState(initialCategory);
  const [selected, setSelected] = useState<Product | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(data => {
      if (active && data?.settings && Array.isArray(data?.products)) setContent(data);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const categories = useMemo(() => ["Всички", ...settings.categories], [settings.categories]);
  const filtered = category === "Всички" ? products : products.filter(p => p.category === category);

  return (
    <main className="static-fallback products-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <h1 className="seo-h1">Бисквитки и сладки — каталог Sweet Details</h1>
      <ShopChrome settings={settings} activeNav="products" />

      <section className="products-page-hero">
        <div className="products-page-hero-inner">
          <span className="section-label">Каталог</span>
          <h2>Нашите бисквитки</h2>
          <p>Избери продукт, форма и опаковка — персонализирани за твоя повод.</p>
        </div>
      </section>

      <section className="section products products-full">
        <div className="filters" role="tablist" aria-label="Филтър по категория">
          {categories.map(c => (
            <button
              key={c}
              type="button"
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="grid">
          {filtered.map(p => <ProductCard product={p} key={p.id} onOpen={() => setSelected(p)} />)}
        </div>
        {!filtered.length && <div className="empty">Скоро ще добавим предложения в тази категория.</div>}
      </section>

      <ShopFooter settings={settings} />
      {selected && <OrderModal product={selected} onClose={() => setSelected(null)} />}
    </main>
  );
}
