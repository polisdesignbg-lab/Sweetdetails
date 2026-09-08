import { createCartOrder, createShopOrder } from "@/lib/shop/checkout";
import type { CartItem, OrderContact, OrderCustomization, ShopProduct, ShopShape } from "@/lib/shop/types";

type Body = {
  product?: ShopProduct;
  shape?: ShopShape;
  quantity?: number;
  customization?: OrderCustomization;
  contact: OrderContact;
  categorySlug?: string;
  cartItems?: CartItem[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as Body;

  if (Array.isArray(body.cartItems) && body.cartItems.length) {
    const result = await createCartOrder({ items: body.cartItems, contact: body.contact });
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json(result);
  }

  if (!body.product) {
    return Response.json({ error: "Невалидна поръчка." }, { status: 400 });
  }

  const result = await createShopOrder({
    product: body.product,
    shape: body.shape,
    quantity: Number(body.quantity) || 0,
    customization: body.customization || {},
    contact: body.contact,
    categorySlug: body.categorySlug,
  });
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result);
}
