"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import type { Product } from "@/lib/defaults";
import { formatEuro } from "@/lib/format";

const productImagePosition: Record<string, string> = {
  baptism: "18% 58%",
  birthday: "50% 58%",
  wedding: "82% 58%",
  graduation: "50% 40%",
};

export function ProductCard({
  product,
  onOpen,
  showDescription = false,
}: {
  product: Product;
  onOpen: () => void;
  showDescription?: boolean;
}) {
  const [slide, setSlide] = useState(0);
  const images = product.images.length ? product.images : ["/products-showcase.png"];
  const objectPosition = productImagePosition[product.id] ?? "center";

  return (
    <article className={`product-card${showDescription ? " product-card-rich" : ""}`}>
      <div className="product-image">
        <Image
          src={images[slide]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized
          style={{ objectFit: "cover", objectPosition }}
        />
        {product.badge && showDescription && <span className="product-badge">{product.badge}</span>}
        {images.length > 1 && (
          <>
            <button
              className="slide prev"
              type="button"
              aria-label="Предишна"
              onClick={() => setSlide((slide - 1 + images.length) % images.length)}
            >
              <ChevronLeft />
            </button>
            <button
              className="slide next"
              type="button"
              aria-label="Следваща"
              onClick={() => setSlide((slide + 1) % images.length)}
            >
              <ChevronRight />
            </button>
          </>
        )}
      </div>
      <div className="product-copy">
        {showDescription && <p className="product-category">{product.category}</p>}
        <h3>{product.title}</h3>
        {showDescription && product.description && <p className="product-desc">{product.description}</p>}
        {showDescription && !!product.shapes?.length && (
          <p className="product-shapes-hint">{product.shapes.length} форми за избор</p>
        )}
        <div className="price-row">
          <strong>{formatEuro(product.price)}</strong>
          <button type="button" aria-label={`Поръчай ${product.title}`} onClick={onOpen}>
            <Heart />
          </button>
        </div>
      </div>
    </article>
  );
}
