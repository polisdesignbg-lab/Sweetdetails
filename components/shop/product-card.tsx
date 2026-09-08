"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ShopProduct } from "@/lib/shop/types";
import { useCatalog } from "./catalog-context";
import { formatEuro } from "@/lib/format";

export function ShopProductCard({ product, categorySlug }: { product: ShopProduct; categorySlug?: string }) {
  const { categories } = useCatalog();
  const cat = categories.find(c => c.id === product.categoryId);
  const slug = categorySlug || cat?.slug || "shop";
  const href = product.isCustomDesign ? "/shop/custom" : `/shop/${slug}/${product.slug}`;
  const img = product.images[0] || "/products-showcase.png";

  return (
    <article className="shop-product-card">
      <a href={href} className="shop-product-card-link">
        <div className="shop-product-card-image">
          <Image src={img} alt={product.title} fill unoptimized sizes="(max-width:700px) 50vw, 33vw" style={{ objectFit: "cover" }} />
          {product.featured && <span className="shop-badge">Най-поръчван</span>}
          {!product.inStock && <span className="shop-badge shop-badge-muted">Изчерпан</span>}
        </div>
        <div className="shop-product-card-body">
          {cat && <span className="shop-product-cat">{cat.name}</span>}
          <h3>{product.title}</h3>
          <p>{product.shortDescription}</p>
          <div className="shop-product-card-foot">
            <span>{formatEuro(product.pricePerUnit)} / бр.</span>
            <span className="shop-cta-mini">{product.isCustomDesign ? "Заяви" : "Персонализирай"} <ArrowRight size={14} /></span>
          </div>
        </div>
      </a>
    </article>
  );
}

export function CategoryCard({ slug, name, description, image }: { slug: string; name: string; description: string; image: string }) {
  return (
    <a href={`/shop/${slug}`} className="shop-category-card">
      <span className="shop-category-card-image">
        <Image src={image || "/shapes/circle.svg"} alt="" width={72} height={72} unoptimized />
      </span>
      <strong>{name}</strong>
      <p>{description}</p>
    </a>
  );
}
