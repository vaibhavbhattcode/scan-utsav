/** Safe same-origin relative redirect only (blocks open redirects). */
export function safeRedirectPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return fallback;
  if (path.includes("://")) return fallback;
  if (/[\n\r\t]/.test(path)) return fallback;
  return path;
}

/** Read CSRF cookie for authenticated fetch calls from the browser. */
export function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/(?:^|;\s*)scanutsav_csrf=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
}

/** fetch wrapper that attaches CSRF header for mutating methods. */
export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf) headers.set("x-csrf-token", csrf);
    if (!headers.has("Content-Type") && init.body && typeof init.body === "string") {
      headers.set("Content-Type", "application/json");
    }
  }
  return fetch(input, { ...init, headers, credentials: "same-origin" });
}
