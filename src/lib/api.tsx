import { API_BASE } from "./constants";

function normalizePath(path: string) {
  if (!path.startsWith("/")) path = "/" + path;
  return path.replace(/\/{2,}/g, "/");
}

let isRefreshing = false;

// NEW: Global logout flag
export let isLoggingOut = false;
export function setLoggingOut(value: boolean) {
  isLoggingOut = value;
}

export async function apiFetch(path: string, options: RequestInit = {}) {

  // if (isLoggingOut) {
  //   throw { status: 401, message: "Logging out" };
  // }


  const url = `${API_BASE}${normalizePath(path)}`;

  const headers = options.headers
    ? new Headers(options.headers)
    : new Headers();

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  options.credentials = "include";
  options.headers = headers;

  let res = await fetch(url, options);

  // ---------------------------------------------------
  // ⭐ ACCESS TOKEN EXPIRED → TRY REFRESH TOKEN
  // ---------------------------------------------------
  if (res.status === 401) {

    // ⛔ Prevent refresh loops during logout
    if (isLoggingOut) {
      throw { status: 401, message: "Logged out" };
    }

    if (!isRefreshing) {
      isRefreshing = true;

      const refreshRes = await fetch(
        `${API_BASE}${normalizePath("refresh-token/")}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      isRefreshing = false;

      if (refreshRes.status !== 200) {

        // Avoid infinite refresh attempts
        isLoggingOut = true;

        await fetch(`${API_BASE}${normalizePath("logout/")}`, {
          method: "POST",
          credentials: "include",
        });


        throw { status: 401, message: "Session expired" };
      }

      // ⭐ REFRESH SUCCESS → retry original
      res = await fetch(url, options);
    } else {
      await new Promise((resolve) => setTimeout(resolve, 200));
      res = await fetch(url, options);
    }
  }

  // ---------------------------------------------------
  // Handle Errors
  // ---------------------------------------------------
  if (!res.ok) {
    const errorText = await res.text();
    let parsedError: any = null;
    try {
      parsedError = JSON.parse(errorText);
    } catch { }

    throw {
      status: res.status,
      message: parsedError?.message || errorText,
    };
  }

  // ---------------------------------------------------
  // JSON only if exists
  // ---------------------------------------------------
  const contentType = res.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return await res.json();
  }

  return null;
}

// ----------------------------------
// Legacy compatibility
// ----------------------------------
export async function apiGet(path: string) {
  return apiFetch(path, { method: "GET" });
}

export async function apiPost(path: string, body: any = {}) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiPut(path: string, body: any = {}) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function apiDelete(path: string) {
  return apiFetch(path, { method: "DELETE" });
}
