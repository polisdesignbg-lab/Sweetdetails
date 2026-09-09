import { env } from "cloudflare:workers";
import {
  buildPushPayload,
  type PushMessage,
  type PushSubscription,
  type VapidKeys,
} from "@block65/webcrypto-web-push";
import type { ShopOrder } from "@/lib/shop/types";

type PushEnv = {
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
};

function getPushEnv(): PushEnv {
  try {
    return env as unknown as PushEnv;
  } catch {
    return {
      VAPID_PUBLIC_KEY: process.env.VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
      VAPID_SUBJECT: process.env.VAPID_SUBJECT,
    };
  }
}

export function getVapidPublicKey() {
  return getPushEnv().VAPID_PUBLIC_KEY || "";
}

function getVapidKeys(): VapidKeys | null {
  const e = getPushEnv();
  if (!e.VAPID_PUBLIC_KEY || !e.VAPID_PRIVATE_KEY) return null;
  return {
    subject: e.VAPID_SUBJECT || "mailto:sweetdetails.bg@gmail.com",
    publicKey: e.VAPID_PUBLIC_KEY,
    privateKey: e.VAPID_PRIVATE_KEY,
  };
}

async function ensurePushTable() {
  await env.DB.prepare(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY NOT NULL,
      p256dh TEXT NOT NULL,
      auth TEXT NOT NULL,
      created_at TEXT NOT NULL
    )
  `).run();
}

export async function savePushSubscription(sub: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  await ensurePushTable();
  await env.DB.prepare(
    `INSERT INTO push_subscriptions (endpoint, p256dh, auth, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(endpoint) DO UPDATE SET p256dh = excluded.p256dh, auth = excluded.auth`,
  )
    .bind(sub.endpoint, sub.keys.p256dh, sub.keys.auth, new Date().toISOString())
    .run();
}

export async function deletePushSubscription(endpoint: string) {
  await ensurePushTable();
  await env.DB.prepare("DELETE FROM push_subscriptions WHERE endpoint = ?").bind(endpoint).run();
}

async function listSubscriptions(): Promise<PushSubscription[]> {
  await ensurePushTable();
  const rows = await env.DB.prepare(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions",
  ).all<{ endpoint: string; p256dh: string; auth: string }>();
  return (rows.results || []).map(r => ({
    endpoint: r.endpoint,
    expirationTime: null,
    keys: { p256dh: r.p256dh, auth: r.auth },
  }));
}

export async function sendOrderPush(order: ShopOrder, orderNumber: string) {
  const vapid = getVapidKeys();
  if (!vapid) {
    console.warn("[push] VAPID keys missing — skip notification");
    return;
  }

  const subscriptions = await listSubscriptions();
  if (!subscriptions.length) {
    console.warn("[push] no admin subscriptions");
    return;
  }

  const title = `Нова поръчка #${orderNumber}`;
  const body = `${order.contact?.fullName || "Клиент"} · ${order.productTitle || "Поръчка"} · ${Number(order.total || 0).toFixed(2)} €`;
  const message: PushMessage = {
    data: JSON.stringify({
      title,
      body,
      url: "/admin",
      orderId: order.id,
      orderNumber,
    }),
    options: { ttl: 60 * 60 * 12, urgency: "high" },
  };

  await Promise.all(
    subscriptions.map(async sub => {
      try {
        const payload = await buildPushPayload(message, sub, vapid);
        const res = await fetch(sub.endpoint, payload);
        if (res.status === 404 || res.status === 410) {
          await deletePushSubscription(sub.endpoint);
        } else if (!res.ok) {
          console.error("[push] send failed", res.status, await res.text().catch(() => ""));
        }
      } catch (err) {
        console.error("[push] send error", err);
      }
    }),
  );
}
