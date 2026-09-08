import { saveOrder } from "@/lib/shop/data";
import { calculateTotal } from "@/lib/shop/pricing";
import type { OrderContact, OrderCustomization, ShopOrder, ShopProduct, ShopShape } from "@/lib/shop/types";

export type CreateOrderInput = {
  product: ShopProduct;
  shape?: ShopShape;
  quantity: number;
  customization: OrderCustomization;
  contact: OrderContact;
  categorySlug?: string;
};

export async function createShopOrder(body: CreateOrderInput) {
  const { product, shape, quantity, customization, contact, categorySlug } = body;

  if (!product?.id || !product.title) {
    return { error: "Липсва продукт.", status: 400 as const };
  }
  if (!contact?.fullName?.trim() || !contact?.email?.trim() || !contact?.phone?.trim() || !contact?.city?.trim()) {
    return { error: "Попълни име, имейл, телефон и населено място.", status: 400 as const };
  }
  if (quantity < product.minQuantity) {
    return { error: `Минималното количество е ${product.minQuantity} бр.`, status: 400 as const };
  }
  if (product.isCustomDesign && !customization?.occasion?.trim()) {
    return { error: "Посочи повода за индивидуалния дизайн.", status: 400 as const };
  }
  if (!customization?.neededByDate) {
    return { error: "Посочи дата, за която са необходими бисквитките.", status: 400 as const };
  }
  if (product.shapeIds.length && !shape?.id) {
    return { error: "Избери форма на бисквитката.", status: 400 as const };
  }

  const shapeAddon = 0;
  const unitPrice = calculateTotal(product, quantity, 0) / quantity;
  const total = calculateTotal(product, quantity, 0);
  const id = crypto.randomUUID();
  const order: ShopOrder = {
    id,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    categorySlug,
    shapeId: shape?.id,
    shapeLabel: shape?.label,
    shapeAddon,
    quantity,
    unitPrice,
    total,
    customization,
    contact: {
      fullName: contact.fullName.trim(),
      email: contact.email.trim(),
      phone: contact.phone.trim(),
      city: contact.city.trim(),
      deliveryNotes: contact.deliveryNotes?.trim(),
    },
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);

  return {
    ok: true as const,
    orderId: id,
    orderNumber: id.slice(0, 8).toUpperCase(),
    redirectUrl: `/shop/thank-you?order=${id}`,
  };
}
