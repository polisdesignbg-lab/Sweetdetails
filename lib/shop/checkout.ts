import { saveOrder } from "@/lib/shop/data";
import { calculateTotal } from "@/lib/shop/pricing";
import { sendOrderEmails } from "@/lib/shop/email";
import type {
  CartItem,
  OrderContact,
  OrderCustomization,
  ShopOrder,
  ShopOrderItem,
  ShopProduct,
  ShopShape,
} from "@/lib/shop/types";

export type CreateOrderInput = {
  product: ShopProduct;
  shape?: ShopShape;
  quantity: number;
  customization: OrderCustomization;
  contact: OrderContact;
  categorySlug?: string;
};

export type CreateCartOrderInput = {
  items: CartItem[];
  contact: OrderContact;
};

function validateContact(contact: OrderContact) {
  if (!contact?.fullName?.trim() || !contact?.email?.trim() || !contact?.phone?.trim()) {
    return "Попълни име, имейл и телефон.";
  }
  if (!contact.econtOffice?.trim()) {
    return "Посочи името на офиса на Еконт.";
  }
  return null;
}

function normalizeContact(contact: OrderContact): OrderContact {
  return {
    fullName: contact.fullName.trim(),
    email: contact.email.trim(),
    phone: contact.phone.trim(),
    city: contact.city?.trim() || "",
    deliveryMethod: "econt_office",
    econtOffice: contact.econtOffice?.trim() || "",
    deliveryNotes: contact.deliveryNotes?.trim(),
  };
}

export async function createShopOrder(body: CreateOrderInput) {
  const { product, shape, quantity, customization, contact, categorySlug } = body;

  if (!product?.id || !product.title) {
    return { error: "Липсва продукт.", status: 400 as const };
  }
  const contactError = validateContact(contact);
  if (contactError) return { error: contactError, status: 400 as const };
  if (quantity < product.minQuantity) {
    return { error: `Минималното количество е ${product.minQuantity} бр.`, status: 400 as const };
  }
  if (product.isCustomDesign) {
    return { error: "Поръчките са само през магазина от качените продукти.", status: 400 as const };
  }
  if (!customization?.neededByDate) {
    return { error: "Посочи дата, за която са необходими бисквитките.", status: 400 as const };
  }
  if (product.shapeIds.length && !shape?.id) {
    return { error: "Избери форма на бисквитката.", status: 400 as const };
  }

  const unitPrice = calculateTotal(product, quantity, 0) / quantity;
  const total = calculateTotal(product, quantity, 0);
  const id = crypto.randomUUID();
  const normalized = normalizeContact(contact);
  const order: ShopOrder = {
    id,
    productId: product.id,
    productTitle: product.title,
    productSlug: product.slug,
    categorySlug,
    shapeId: shape?.id,
    shapeLabel: shape?.label,
    shapeAddon: 0,
    quantity,
    unitPrice,
    total,
    items: [{
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      categorySlug,
      shapeId: shape?.id,
      shapeLabel: shape?.label,
      quantity,
      unitPrice,
      lineTotal: total,
      image: product.images?.[0],
      customization,
    }],
    customization,
    contact: normalized,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);
  const orderNumber = id.slice(0, 8).toUpperCase();
  await sendOrderEmails(order, orderNumber);
  try {
    const { sendOrderPush } = await import("@/lib/shop/push");
    await sendOrderPush(order, orderNumber);
  } catch (err) {
    console.error("[push] failed", err);
  }

  return {
    ok: true as const,
    orderId: id,
    orderNumber,
    redirectUrl: `/shop/thank-you?order=${id}`,
  };
}

export async function createCartOrder(body: CreateCartOrderInput) {
  const { items, contact } = body;
  if (!items?.length) return { error: "Количката е празна.", status: 400 as const };

  const contactError = validateContact(contact);
  if (contactError) return { error: contactError, status: 400 as const };

  for (const item of items) {
    if (!item.productId || !item.productTitle) {
      return { error: "Невалиден продукт в количката.", status: 400 as const };
    }
    if (item.quantity < (item.minQuantity || 1)) {
      return { error: `Минималното количество за „${item.productTitle}“ е ${item.minQuantity} бр.`, status: 400 as const };
    }
    if (!item.customization?.neededByDate) {
      return { error: `Посочи дата на готовност за „${item.productTitle}“.`, status: 400 as const };
    }
  }

  const orderItems: ShopOrderItem[] = items.map(item => ({
    productId: item.productId,
    productTitle: item.productTitle,
    productSlug: item.productSlug,
    categorySlug: item.categorySlug,
    shapeId: item.shapeId,
    shapeLabel: item.shapeLabel,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    lineTotal: item.unitPrice * item.quantity,
    image: item.image,
    customization: item.customization,
  }));

  const total = orderItems.reduce((sum, i) => sum + i.lineTotal, 0);
  const first = orderItems[0];
  const id = crypto.randomUUID();
  const normalized = normalizeContact(contact);

  const order: ShopOrder = {
    id,
    productId: first.productId,
    productTitle: orderItems.length > 1
      ? `${first.productTitle} (+${orderItems.length - 1})`
      : first.productTitle,
    productSlug: first.productSlug,
    categorySlug: first.categorySlug,
    shapeId: first.shapeId,
    shapeLabel: first.shapeLabel,
    shapeAddon: 0,
    quantity: orderItems.reduce((sum, i) => sum + i.quantity, 0),
    unitPrice: first.unitPrice,
    total,
    items: orderItems,
    customization: first.customization,
    contact: normalized,
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await saveOrder(order);
  const orderNumber = id.slice(0, 8).toUpperCase();
  await sendOrderEmails(order, orderNumber);
  try {
    const { sendOrderPush } = await import("@/lib/shop/push");
    await sendOrderPush(order, orderNumber);
  } catch (err) {
    console.error("[push] failed", err);
  }

  return {
    ok: true as const,
    orderId: id,
    orderNumber,
    redirectUrl: `/shop/thank-you?order=${id}`,
  };
}
