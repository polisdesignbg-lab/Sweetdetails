"use client";

import { CatalogProvider } from "@/components/shop/catalog-context";
import { ShopHomeView } from "@/components/shop/shop-home-view";

export default function ShopPage() {
  return (
    <CatalogProvider>
      <ShopHomeView />
    </CatalogProvider>
  );
}
