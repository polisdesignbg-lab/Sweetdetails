"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ShopCatalog } from "@/lib/shop/types";
import { defaultShopSettings } from "@/lib/shop/seed";

const CatalogContext = createContext<ShopCatalog | null>(null);

export function CatalogProvider({ children, initial }: { children: React.ReactNode; initial?: ShopCatalog }) {
  const [catalog, setCatalog] = useState<ShopCatalog | null>(initial ?? null);
  useEffect(() => {
    if (initial) return;
    fetch("/api/shop").then(r => r.ok ? r.json() : null).then(d => d && setCatalog(d)).catch(() => {});
  }, [initial]);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  return ctx ?? { categories: [], shapes: [], products: [], settings: defaultShopSettings };
}
