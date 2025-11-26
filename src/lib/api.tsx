// src/lib/api.ts

// Base URL from .env
export const API_BASE =
  (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/")
    .replace(/\/+$/, "");

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function normalizePath(path: string) {
  let p = String(path).trim();
  if (/^https?:\/\//i.test(p)) {
    try {
      const u = new URL(p);
      p = u.pathname;
    } catch { }
  }
  return `/${p.replace(/^\/+/, "").replace(/\/+$/, "")}/`;
}

export async function apiFetch<T = any>(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const url = `${API_BASE}${normalizePath(path)}`;

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: "include", // critical for HttpOnly cookie auth
  });

  const data = await safeJson(res);

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.detail ||
      data?.error ||
      `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data as T;
}

export const apiGet = <T = any>(path: string) =>
  apiFetch<T>(path, { method: "GET" });

export const apiPost = <T = any>(path: string, body: any) =>
  apiFetch<T>(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
