import { isAdminRequest } from "@/lib/admin-auth";
import { getVapidPublicKey } from "@/lib/shop/push";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return Response.json({ error: "VAPID public key not configured" }, { status: 503 });
  }
  return Response.json({ publicKey });
}
