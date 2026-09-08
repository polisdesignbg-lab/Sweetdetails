import { createShopOrder } from "@/lib/shop/checkout";
import type { OrderContact, OrderCustomization, ShopProduct, ShopShape } from "@/lib/shop/types";

/** Shop product checkout only — legacy free-form orders are disabled. */
export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const product = body.product as ShopProduct | undefined;

  if (!product?.id || !product?.slug || !product?.title) {
    return Response.json(
      { error: "Поръчките са само през магазина от качените продукти." },
      { status: 400 },
    );
  }

  const result = await createShopOrder(body as {
    product: ShopProduct;
    shape?: ShopShape;
    quantity: number;
    customization: OrderCustomization;
    contact: OrderContact;
    categorySlug?: string;
  });
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result);
}
