import { defaultProducts, defaultSettings } from "@/lib/defaults";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import ProductsCatalog from "@/components/products-catalog";
import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Всички бисквитки",
  description:
    "Разгледай персонализирани бисквитки за кръщене, сватба, рожден ден и завършване. Избери форма и поръчай онлайн от Sweet Details.",
  alternates: {
    canonical: "/products",
    languages: { "bg-BG": "/products" },
  },
  openGraph: {
    title: `Всички бисквитки | ${SITE_NAME}`,
    description: "Бисквитки за кръщене, сватба, рожден ден и завършване с избор на форма.",
    url: `${SITE_URL}/products`,
  },
};

export default function ProductsPage() {
  return <ProductsCatalog initial={{ settings: defaultSettings, products: defaultProducts }} />;
}
