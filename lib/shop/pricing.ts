import type { PriceTier, ShopProduct } from "./types";

export function getUnitPrice(product: ShopProduct, _quantity?: number): number {
  return product.pricePerUnit;
}

export function calculateTotal(product: ShopProduct, quantity: number, shapeAddon = 0): number {
  const unit = getUnitPrice(product, quantity);
  return unit * quantity + shapeAddon;
}

export function formatPriceTiers(tiers: PriceTier[]): string {
  if (!tiers.length) return "";
  return tiers
    .map(t => {
      const range = t.max ? `${t.min}–${t.max} бр.` : `${t.min}+ бр.`;
      return `${range}: ${t.pricePerUnit.toFixed(2)} €/бр.`;
    })
    .join(" · ");
}

export function minLeadDate(minLeadDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + minLeadDays);
  return d.toISOString().slice(0, 10);
}
