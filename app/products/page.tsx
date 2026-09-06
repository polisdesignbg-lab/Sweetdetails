import type { Metadata } from "next";
import { defaultProducts, defaultSettings } from "@/lib/defaults";
import ProductsView from "./products-view";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Бисквитки и сладки — каталог",
  description: "Разгледай всички персонализирани бисквитки Sweet Details — за кръщене, рожден ден, сватба и всеки повод.",
  alternates: { canonical: "/products" },
};

type Props = {
  searchParams?: Promise<{ cat?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const initialCategory = params.cat && decodeURIComponent(params.cat);
  const content = { settings: defaultSettings, products: defaultProducts };

  return (
    <ProductsView
      initial={content}
      initialCategory={initialCategory || "Всички"}
    />
  );
}
