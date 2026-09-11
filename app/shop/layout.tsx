import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Поръчай персонализирани бисквитки — магазин",
  description: "Избери дизайн по повод — кръщене, рожден ден, сватба и други. Персонализирай надпис, форма и количество.",
  alternates: { canonical: "/shop" },
  openGraph: {
    title: "Sweet Details — онлайн магазин за бисквитки",
    description: "Поръчай персонализирани бисквитки с фонданов печат.",
    images: [{ url: "/products-showcase.png" }],
  },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
