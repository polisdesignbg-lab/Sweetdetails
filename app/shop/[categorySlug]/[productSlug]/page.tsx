"use client";

import { useParams } from "next/navigation";
import { CatalogProvider } from "@/components/shop/catalog-context";
import { ProductView } from "@/components/shop/shop-views";

export default function ShopProductPage() {
  const params = useParams();
  return (
    <CatalogProvider>
      <ProductView categorySlug={String(params.categorySlug || "")} productSlug={String(params.productSlug || "")} />
    </CatalogProvider>
  );
}
