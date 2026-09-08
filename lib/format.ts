/** Format product/order price in EUR */
export function formatEuro(amount: number | null | undefined): string {
  const value = typeof amount === "number" && Number.isFinite(amount) ? amount : 0;
  return `${value.toFixed(2)} €`;
}

/** Free delivery threshold in EUR */
export const FREE_DELIVERY_EUR = 41;
