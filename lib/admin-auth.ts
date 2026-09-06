const encoder = new TextEncoder();
export const ADMIN_COOKIE = "cookie-admin";

async function sign(value: string) {
  const secret = process.env.ADMIN_PASSWORD || "setup-required";
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const bytes = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function makeAdminToken() {
  return sign("authorized");
}

export async function verifyAdminToken(token: string | null | undefined) {
  if (!token) return false;
  return token === await sign("authorized");
}

function readCookie(header: string | null, name: string) {
  if (!header) return null;
  for (const part of header.split(";")) {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${name}=`)) continue;
    return decodeURIComponent(trimmed.slice(name.length + 1));
  }
  return null;
}

export function getAdminTokenFromRequest(request: Request) {
  const auth = request.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return readCookie(request.headers.get("cookie"), ADMIN_COOKIE);
}

export async function isAdminRequest(request: Request) {
  return verifyAdminToken(getAdminTokenFromRequest(request));
}

export async function isAdmin() {
  try {
    const { cookies } = await import("next/headers");
    const jar = await cookies();
    return verifyAdminToken(jar.get(ADMIN_COOKIE)?.value);
  } catch {
    return false;
  }
}
