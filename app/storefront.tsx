"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowRight, Baby, BriefcaseBusiness, CalendarHeart, Ellipsis, GraduationCap, Heart, Truck } from "lucide-react";
import type { SiteSettings } from "@/lib/defaults";
import { defaultSettings } from "@/lib/defaults";
import { SEO_FAQ } from "@/lib/seo";
import { FREE_DELIVERY_EUR } from "@/lib/format";
import { ShopChrome, ShopFooter } from "@/components/shop-chrome";
import { CatalogProvider, useCatalog } from "@/components/shop/catalog-context";
import { ShopProductCard } from "@/components/shop/product-card";

type Props = { initial: { settings: SiteSettings } };

function HomeFavorites() {
  const catalog = useCatalog();
  const featured = catalog.products.filter(p => p.featured && p.active && !p.isCustomDesign);

  if (!catalog.products.length) {
    return <p className="shop-empty">Зареждане на продукти…</p>;
  }

  if (!featured.length) {
    return (
      <p className="shop-empty">
        Все още няма отбелязани най-поръчвани.{" "}
        <a href="/shop">Разгледай магазина</a>
      </p>
    );
  }

  return (
    <div className="grid home-featured-grid">
      {featured.map(p => (
        <ShopProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

export default function Storefront({ initial }: Props) {
  const [settings, setSettings] = useState(initial.settings);

  useEffect(() => {
    let active = true;
    fetch("/api/content").then(r => (r.ok ? r.json() : null)).then(data => {
      if (active && data?.settings) setSettings(data.settings);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const scrollToCategory = (cat: string) => {
    const map: Record<string, string> = {
      "Кръщене": "krashtene",
      "Рожден ден": "rozhden-den",
      "Сватба": "svatba",
      "Завършване": "detska-gradina-uchilishte",
      "Фирмени": "firmeni-biskvitki",
    };
    const slug = map[cat];
    window.location.href = slug ? `/shop/${slug}` : "/shop";
  };

  return (
    <main className="static-fallback" style={{ "--brand": settings.primaryColor } as React.CSSProperties}>
      <h1 className="seo-h1">Персонализирани бисквити и сладки за всеки празник — Sweet Details</h1>
      <ShopChrome settings={settings} activeNav="home" />

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
          <a href="/shop" className="hero-cta-overlay" aria-label="Разгледай бисквитките">РАЗГЛЕДАЙ</a>
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
            <button key={c} type="button" className={`cat-${slug}`} onClick={() => scrollToCategory(c === "Фирмени" ? "Фирмени" : c)}>
              <span><Icon strokeWidth={2.25} /></span>
              <strong>{c === "Фирмени" ? "Фирмени събития" : c}</strong>
            </button>
          );
        })}
      </section>

      <section id="products" className="section products">
        <div className="section-head favorites-title">
          <h2>Най-поръчвани <Heart fill="currentColor" /></h2>
          <a href="/shop" className="view-all-link">Виж всички <ArrowRight /></a>
        </div>
        <CatalogProvider>
          <HomeFavorites />
        </CatalogProvider>
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
          <div className="step-card"><span>1</span><h3>Избери бисквитки</h3><p>Избери продукт от магазина и количество — минимум 10 бр.</p></div>
          <div className="step-card"><span>2</span><h3>Опиши желанието</h3><p>Избери форма, добави текст и примерна снимка, ако имаш.</p></div>
          <div className="step-card"><span>3</span><h3>Изпрати поръчката</h3><p>Добави в количката и поръчай с име, имейл, телефон и Еконт офис.</p></div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-inner">
          <div className="about-copy">
            <span className="section-label">За Sweet Details</span>
            <h2>Ръчно изработени бисквитки с лично послание</h2>
            <p>{settings.about || defaultSettings.about}</p>
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

      <ShopFooter settings={settings} />
    </main>
  );
}
