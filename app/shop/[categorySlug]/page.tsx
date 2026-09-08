"use client";

import { useParams } from "next/navigation";
import { CatalogProvider } from "@/components/shop/catalog-context";
import { CategoryView } from "@/components/shop/shop-views";

export default function ShopCategoryPage() {
  const params = useParams();
  const categorySlug = String(params.categorySlug || "");
  return (
    <CatalogProvider>
      <CategoryView slug={categorySlug} />
    </CatalogProvider>
  );
}
