/** Format product/order price in EUR */
export function formatEuro(amount: number): string {
  return `${amount.toFixed(2)} €`;
}

/** Free delivery threshold in EUR */
export const FREE_DELIVERY_EUR = 41;
