"use client";

import { useEffect, useState } from "react";
import { useCatalog } from "./catalog-context";
import { ShopProductCard } from "./product-card";
import { ProductGallery, ShopOrderForm } from "./order-form";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";
import { defaultSettings } from "@/lib/defaults";
import type { SiteSettings } from "@/lib/defaults";
import { formatEuro } from "@/lib/format";

export function CategoryView({ slug }: { slug: string }) {
  const catalog = useCatalog();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const cat = catalog.categories.find(c => c.slug === slug && !c.slug.includes("individualen"));
  const products = catalog.products.filter(p => p.categoryId === cat?.id && p.active && !p.isCustomDesign);

  useEffect(() => {
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(d => d?.settings && setSettings(d.settings)).catch(() => {});
  }, []);

  if (!cat) return <main className="static-fallback shop-page"><ShopChrome settings={settings} activeNav="shop" /><div className="shop-section"><p>Категорията не е намерена.</p><a href="/shop">← Към магазина</a></div></main>;

  return (
    <main className="static-fallback shop-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <ShopChrome settings={settings} activeNav="shop" />
      <section className="shop-hero shop-hero-compact">
        <a href="/shop" className="shop-back">← Магазин</a>
        <h1>{cat.name}</h1>
        <p>{cat.description}</p>
      </section>
      <section className="shop-section">
        <div className="shop-product-grid">{products.map(p => <ShopProductCard key={p.id} product={p} categorySlug={slug} />)}</div>
        {!products.length && <p className="shop-empty">Скоро ще добавим продукти в тази категория.</p>}
      </section>
      <ShopFooter settings={settings} />
    </main>
  );
}

export function ProductView({ categorySlug, productSlug }: { categorySlug: string; productSlug: string }) {
  const catalog = useCatalog();
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const product = catalog.products.find(p => p.slug === productSlug);
  const cat = catalog.categories.find(c => c.slug === categorySlug);

  useEffect(() => {
    fetch("/api/content").then(r => r.ok ? r.json() : null).then(d => d?.settings && setSettings(d.settings)).catch(() => {});
  }, []);

  if (!product) return <CategoryView slug={categorySlug} />;

  const related = catalog.products.filter(p => p.categoryId === product.categoryId && p.id !== product.id && p.active && !p.isCustomDesign);

  if (product.isCustomDesign) {
    return <CategoryView slug={categorySlug} />;
  }

  return (
    <main className="static-fallback shop-page" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <ShopChrome settings={settings} activeNav="shop" />
      <section className="shop-product-detail">
        <a href={`/shop/${categorySlug}`} className="shop-back">← {cat?.name || "Категория"}</a>
        <div className="shop-product-layout">
          <ProductGallery images={product.images} title={product.title} />
          <div className="shop-product-info">
            <span className="shop-product-cat">{cat?.name}</span>
            <h1>{product.title}</h1>
            <p className="shop-product-lead">{product.shortDescription}</p>
            <p className="shop-price-from">{formatEuro(product.pricePerUnit)} / бр.</p>
            <div className="shop-info-blocks">
              {product.sizeInfo && <div><strong>Размер</strong><p>{product.sizeInfo}</p></div>}
              {product.packagingInfo && <div><strong>Опаковка</strong><p>{product.packagingInfo}</p></div>}
              {product.productInfo && <div><strong>За продукта</strong><p>{product.productInfo}</p></div>}
            </div>
            <div className="shop-desc">{product.description}</div>
          </div>
        </div>
        <ShopOrderForm product={product} categorySlug={categorySlug} />
        {!!related.length && (
          <section className="shop-related">
            <h2>Още от {cat?.name}</h2>
            <div className="shop-product-grid">{related.map(p => <ShopProductCard key={p.id} product={p} categorySlug={categorySlug} />)}</div>
          </section>
        )}
      </section>
      <ShopFooter settings={settings} />
    </main>
  );
}

export function CustomDesignView() {
  return <ShopFallback settings={defaultSettings} message="Поръчките са само през магазина от качените продукти." />;
}

function ShopFallback({ settings, message }: { settings: SiteSettings; message: string }) {
  return (
    <main className="static-fallback shop-page">
      <ShopChrome settings={settings} activeNav="shop" />
      <div className="shop-section"><p>{message}</p><a href="/shop">← Магазин</a></div>
    </main>
  );
}
