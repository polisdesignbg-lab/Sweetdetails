import { cookies } from "next/headers";

const encoder = new TextEncoder();
async function sign(value: string) {
  const secret = process.env.ADMIN_PASSWORD || "setup-required";
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC", hash:"SHA-256"}, false, ["sign"]);
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes).map((b)=>b.toString(16).padStart(2,"0")).join("");
}
export async function isAdmin() {
  const jar = await cookies();
  return jar.get("cookie-admin")?.value === await sign("authorized");
}
export async function makeAdminToken() { return sign("authorized"); }
