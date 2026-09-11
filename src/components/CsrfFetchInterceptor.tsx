"use client";

import { useEffect } from "react";
import { getCsrfToken } from "@/lib/client-api";

/** Ensures mutating same-origin /api calls include double-submit CSRF header. */
export function CsrfFetchInterceptor() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const original = window.fetch.bind(window);

    window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      const method = (init?.method || (input instanceof Request ? input.method : "GET")).toUpperCase();
      let url = "";
      if (typeof input === "string") url = input;
      else if (input instanceof URL) url = input.toString();
      else if (input instanceof Request) url = input.url;

      const isApi =
        url.startsWith("/api/") ||
        (typeof window !== "undefined" && url.startsWith(window.location.origin + "/api/"));

      if (isApi && ["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const headers = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
        if (!headers.has("x-csrf-token")) {
          const csrf = getCsrfToken();
          if (csrf) headers.set("x-csrf-token", csrf);
        }
        return original(input, { ...init, headers, credentials: init?.credentials || "same-origin" });
      }

      return original(input, init);
    };

    return () => {
      window.fetch = original;
    };
  }, []);

  return null;
}
