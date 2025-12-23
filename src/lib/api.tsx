import { API_BASE } from "./constants";
import { useApiLoader } from "../contexts/ApiLoaderContext";

/* --------------------------------------------------
   GLOBAL REFRESH MANAGEMENT (PRODUCTION SAFE)
-------------------------------------------------- */
let startLoader: (() => void) | null = null;
let stopLoader: (() => void) | null = null;

export const bindGlobalLoader = (
  start: () => void,
  stop: () => void
) => {
  startLoader = start;
  stopLoader = stop;
};

let isRefreshing = false;
let waitingQueue: Array<(ok: boolean) => void> = [];

async function runRefresh(base: string) {
  try {
    const res = await fetch(`${base}/refresh-token/`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Refresh failed");

    localStorage.setItem("LAST_REFRESH", Date.now().toString());

    waitingQueue.forEach((cb) => cb(true));
    waitingQueue = [];
    return true;

  } catch (err) {
    waitingQueue.forEach((cb) => cb(false));
    waitingQueue = [];
    return false;

  } finally {
    isRefreshing = false;
  }
}

/* --------------------------------------------------
   MAIN apiFetch FUNCTION (ALL API CALLS USE THIS)
-------------------------------------------------- */
export async function apiFetch(path: string, options: any = {}) {
  startLoader?.();   // 🔥 START LOADER

  try {
    const base = API_BASE;
    const cleanPath = path.replace(/^\/+/, "");
    const url = `${base}/${cleanPath}`;

    const headers: any = {
      "Accept": "application/json",
    };

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const config: any = {
      method: options.method || "GET",
      headers,
      credentials: "include",
      body: options.body || undefined,
    };

    let res = await fetch(url, config);

    /* --------------------------------------------------
       HANDLE 401 → REFRESH TOKEN WORKFLOW
    -------------------------------------------------- */
    if (res.status === 401) {
      if (!isRefreshing) {
        isRefreshing = true;
        runRefresh(base);
      }

      const retryPromise = new Promise<boolean>((resolve) => {
        waitingQueue.push(resolve);
      });

      const refreshSuccess = await retryPromise;

      if (!refreshSuccess) {
        throw { status: 401, message: "Session expired" };
      }

      res = await fetch(url, config);
    }

    /* --------------------------------------------------
       PARSE & RETURN JSON
    -------------------------------------------------- */
    if (!res.ok) {
      let error: any = null;
      try {
        error = await res.json();
      } catch {
        error = { message: "Request failed" };
      }

      throw {
        status: res.status,
        message: error.message || "Request error",
        error,
      };
    }

    try {
      return await res.json();
    } catch {
      return null;
    }

  } finally {
    stopLoader?.();   // 🔥 STOP LOADER (ALWAYS)
  }
}

/* --------------------------------------------------
   SIMPLE GET WRAPPER
-------------------------------------------------- */
export async function apiGet(path: string) {
  return apiFetch(path, { method: "GET" });
}

/* --------------------------------------------------
   SIMPLE POST
-------------------------------------------------- */
export async function apiPost(path: string, data: any) {
  return apiFetch(path, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/* --------------------------------------------------
   SIMPLE PUT
-------------------------------------------------- */
export async function apiPut(path: string, data: any) {
  return apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/* --------------------------------------------------
   SIMPLE DELETE
-------------------------------------------------- */
export async function apiDelete(path: string) {
  return apiFetch(path, {
    method: "DELETE",
  });
}

/* --------------------------------------------------
   MULTIPART POST (KEEPING ORIGINAL FUNCTIONALITY)
-------------------------------------------------- */
export async function apiPostMultipart(path: string, formData: FormData) {
  return apiFetch(path, {
    method: "POST",
    body: formData,
  });
}
