import { isAdminRequest } from "@/lib/admin-auth";
import { getOrders, updateOrderStatus } from "@/lib/shop/data";
import type { OrderStatus } from "@/lib/shop/types";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  return Response.json({ orders: await getOrders() });
}

export async function PATCH(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id, status } = (await request.json()) as { id?: string; status?: OrderStatus };
  if (!id || !status) return Response.json({ error: "invalid" }, { status: 400 });
  const ok = await updateOrderStatus(id, status);
  if (!ok) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json({ ok: true });
}
