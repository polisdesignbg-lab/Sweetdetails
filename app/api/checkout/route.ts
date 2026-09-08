import { createShopOrder } from "@/lib/shop/checkout";
import type { OrderContact, OrderCustomization, ShopProduct, ShopShape } from "@/lib/shop/types";

/** Legacy checkout — forwards to shop order (no Stripe). */
export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;

  if ((body.product as ShopProduct | undefined)?.slug) {
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

  const legacy = body as {
    product?: { id: string; title: string; price: number; minQuantity?: number };
    quantity?: number;
    values?: Record<string, unknown>;
    contact?: { name: string; email: string; phone: string; city?: string };
  };

  if (!legacy.product?.title || !legacy.contact?.name) {
    return Response.json({ error: "Невалидна поръчка." }, { status: 400 });
  }

  const result = await createShopOrder({
    product: {
      id: legacy.product.id,
      slug: legacy.product.id,
      title: legacy.product.title,
      shortDescription: "",
      description: "",
      categoryId: "",
      images: [],
      pricePerUnit: legacy.product.price,
      priceTiers: [],
      minQuantity: legacy.product.minQuantity ?? 10,
      quantityStep: 1,
      shapeIds: [],
      themeColors: [],
      sizeInfo: "",
      packagingInfo: "",
      productInfo: "",
      featured: false,
      active: true,
      inStock: true,
      isCustomDesign: false,
      seoTitle: legacy.product.title,
      seoDescription: "",
      position: 0,
    },
    quantity: Number(legacy.quantity) || 10,
    customization: {
      inscription: String(legacy.values?.printText || ""),
      notes: String(legacy.values?.brief || ""),
      neededByDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
    contact: {
      fullName: legacy.contact.name,
      email: legacy.contact.email,
      phone: legacy.contact.phone,
      city: legacy.contact.city || "—",
    },
  });

  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ message: `Поръчката е записана с номер ${result.orderNumber}. Ще се свържем с теб скоро.` });
}
