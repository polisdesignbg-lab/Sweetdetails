import { createShopOrder } from "@/lib/shop/checkout";
import type { OrderContact, OrderCustomization, ShopProduct, ShopShape } from "@/lib/shop/types";

type Body = {
  product: ShopProduct;
  shape?: ShopShape;
  quantity: number;
  customization: OrderCustomization;
  contact: OrderContact;
  categorySlug?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;
  const result = await createShopOrder(body);
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result);
}
