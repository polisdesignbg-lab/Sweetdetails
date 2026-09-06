export const ADMIN_TOKEN_KEY = "sd-admin-token";

export function storeAdminToken(token: string) {
  sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function getStoredAdminToken() {
  return sessionStorage.getItem(ADMIN_TOKEN_KEY);
}

export function clearAdminToken() {
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function adminFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getStoredAdminToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!headers.has("content-type") && init.body && typeof init.body === "string") {
    headers.set("content-type", "application/json");
  }
  return fetch(input, { ...init, headers, credentials: "include" });
}
