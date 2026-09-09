import { isAdminRequest } from "@/lib/admin-auth";
import { deletePushSubscription, savePushSubscription } from "@/lib/shop/push";

export async function POST(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json()) as {
    endpoint?: string;
    keys?: { p256dh?: string; auth?: string };
  };
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json({ error: "invalid subscription" }, { status: 400 });
  }
  await savePushSubscription({
    endpoint: body.endpoint,
    keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
  });
  return Response.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as { endpoint?: string };
  if (!body.endpoint) {
    return Response.json({ error: "missing endpoint" }, { status: 400 });
  }
  await deletePushSubscription(body.endpoint);
  return Response.json({ ok: true });
}
