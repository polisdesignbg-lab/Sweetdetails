import { env } from "cloudflare:workers";
import type { ShopOrder } from "@/lib/shop/types";
import { formatEuro } from "@/lib/format";

type MailEnv = {
  RESEND_API_KEY?: string;
  ORDER_NOTIFY_EMAIL?: string;
  ORDER_FROM_EMAIL?: string;
};

function getMailEnv(): MailEnv {
  try {
    return env as unknown as MailEnv;
  } catch {
    return {};
  }
}

function orderLines(order: ShopOrder): string {
  const items = order.items?.length
    ? order.items
    : [{
        productTitle: order.productTitle,
        quantity: order.quantity,
        shapeLabel: order.shapeLabel,
        unitPrice: order.unitPrice,
        lineTotal: order.total,
        customization: order.customization,
      }];

  return items.map((item, i) => {
    const c = item.customization;
    return [
      `${i + 1}. ${item.productTitle}`,
      `   Количество: ${item.quantity} бр.`,
      `   Форма: ${item.shapeLabel || "—"}`,
      `   Надпис: ${c.inscription || "—"}`,
      `   Име: ${c.childName || "—"}`,
      `   Дата върху дизайна: ${c.designDate || "—"}`,
      `   Цвят: ${c.themeColor === "Друго" ? c.customColor || "Друго" : c.themeColor || "—"}`,
      `   Необходими до: ${c.neededByDate || "—"}`,
      `   Сума: ${formatEuro(item.lineTotal)}`,
    ].join("\n");
  }).join("\n\n");
}

function buildEmailText(order: ShopOrder, orderNumber: string): string {
  const c = order.contact;
  return [
    `Нова поръчка #${orderNumber}`,
    "",
    `Клиент: ${c.fullName}`,
    `Телефон: ${c.phone}`,
    `Имейл: ${c.email}`,
    c.city ? `Град: ${c.city}` : "",
    `Доставка: до офис на Еконт`,
    `Офис Еконт: ${c.econtOffice || "—"}`,
    c.deliveryNotes ? `Бележки: ${c.deliveryNotes}` : "",
    "",
    "Продукти:",
    orderLines(order),
    "",
    `Общо: ${formatEuro(order.total)}`,
    `Дата: ${new Date(order.createdAt).toLocaleString("bg-BG")}`,
  ].filter(Boolean).join("\n");
}

export async function sendOrderEmails(order: ShopOrder, orderNumber: string) {
  const mailEnv = getMailEnv();
  const apiKey = mailEnv.RESEND_API_KEY || (typeof process !== "undefined" ? process.env.RESEND_API_KEY : undefined);
  const notifyTo = mailEnv.ORDER_NOTIFY_EMAIL
    || (typeof process !== "undefined" ? process.env.ORDER_NOTIFY_EMAIL : undefined)
    || "sweetdetails.bg@gmail.com";
  const fromEmail = mailEnv.ORDER_FROM_EMAIL
    || (typeof process !== "undefined" ? process.env.ORDER_FROM_EMAIL : undefined)
    || "Sweet Details <onboarding@resend.dev>";

  if (!apiKey) {
    console.log("[order-email] skipped (no RESEND_API_KEY). Order:", orderNumber);
    return { sent: false as const, reason: "missing_api_key" };
  }

  const text = buildEmailText(order, orderNumber);
  const subject = `Нова поръчка #${orderNumber} — Sweet Details`;

  const payloads = [
    {
      from: fromEmail,
      to: [notifyTo],
      subject,
      text,
      reply_to: order.contact.email,
    },
    {
      from: fromEmail,
      to: [order.contact.email],
      subject: `Получихме поръчката ви #${orderNumber}`,
      text: [
        `Здравейте, ${order.contact.fullName}!`,
        "",
        `Получихме вашата поръчка #${orderNumber}.`,
        `Ще се свържем с вас скоро за потвърждение.`,
        "",
        `Доставка до офис Еконт: ${order.contact.econtOffice || "—"}`,
        `Общо: ${formatEuro(order.total)}`,
        "",
        "Благодарим ви!",
        "Sweet Details",
        "sweetdetails.bg@gmail.com",
      ].join("\n"),
    },
  ];

  try {
    for (const body of payloads) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.text();
        console.error("[order-email] resend failed:", res.status, err);
      }
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[order-email] error:", err);
    return { sent: false as const, reason: "send_failed" };
  }
}
