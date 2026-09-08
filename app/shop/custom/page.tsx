"use client";

import { CatalogProvider } from "@/components/shop/catalog-context";
import { CustomDesignView } from "@/components/shop/shop-views";

export default function CustomDesignPage() {
  return (
    <CatalogProvider>
      <CustomDesignView />
    </CatalogProvider>
  );
}
