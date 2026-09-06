import { isAdminRequest } from "@/lib/admin-auth";

export async function GET(request: Request) {
  return Response.json({ ok: await isAdminRequest(request) });
}
