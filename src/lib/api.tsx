import { API_BASE } from "./constants";

/* --------------------------------------------------
   Normalize paths consistently (“products/watches/”)
-------------------------------------------------- */
function normalizePath(path: string) {
  return path.replace(/^\//, "");
}

/* --------------------------------------------------
   Refresh control
-------------------------------------------------- */
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

function shouldRefresh() {
  const last = localStorage.getItem("LAST_REFRESH");
  if (!last) return true;
  return Date.now() - Number(last) > 9 * 60 * 1000; // 9 minutes
}

/* --------------------------------------------------
   MAIN API FETCHER (FAST, SAFE, CLEAN)
-------------------------------------------------- */
export async function apiFetch(path: string, options: RequestInit = {}) {
  // Ensure base URL always ends cleanly
  const base = API_BASE.replace(/\/$/, "");
  const url = `${base}/${normalizePath(path)}`;

  // Build headers
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  };

  // INITIAL REQUEST
  let res = await fetch(url, config);

  /* --------------------------------------------------
     Handle 401 with optimized controlled refresh
  -------------------------------------------------- */
  if (res.status === 401 && shouldRefresh()) {
    if (!isRefreshing) {
      isRefreshing = true;

      refreshPromise = fetch(`${base}/refresh-token/`, {
        method: "POST",
        credentials: "include",
      })
        .then((r) => {
          if (!r.ok) throw new Error("Refresh failed");
          localStorage.setItem("LAST_REFRESH", Date.now().toString());
        })
        .catch(() => {
          // Auto logout silently when refresh fails
          fetch(`${base}/logout/`, {
            method: "POST",
            credentials: "include",
          });
          throw new Error("Session expired");
        })
        .finally(() => {
          isRefreshing = false;
        });
    }

    // Wait for refresh to finish
    await refreshPromise;

    // Retry original call (FAST)
    res = await fetch(url, config);
  }

  /* --------------------------------------------------
     If STILL not ok → throw structured error
  -------------------------------------------------- */
  if (!res.ok) {
    const text = await res.text();
    try {
      const json = JSON.parse(text);
      throw { status: res.status, message: json?.message || text };
    } catch {
      throw { status: res.status, message: text };
    }
  }

  /* --------------------------------------------------
     Return JSON only if content-type is JSON
  -------------------------------------------------- */
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return res.json();
  }

  return null;
}

/* --------------------------------------------------
   SHORTHAND HELPERS
-------------------------------------------------- */
export const apiGet = (path: string) => apiFetch(path, { method: "GET" });

export const apiPost = (path: string, body: any = {}) =>
  apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPut = (path: string, body: any = {}) =>
  apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiDelete = (path: string) =>
  apiFetch(path, { method: "DELETE" });
