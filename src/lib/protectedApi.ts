import { apiFetch } from "./api";

/* ---------------------------------------------
   🔥 10-second GET Cache for Smooth UX
---------------------------------------------- */
const GET_CACHE: Record<string, any> = {};
const CACHE_TTL = 10_000;

function getCached(path: string) {
    const entry = GET_CACHE[path];
    if (!entry) return null;

    const { timestamp, data } = entry;
    if (Date.now() - timestamp > CACHE_TTL) {
        delete GET_CACHE[path];
        return null;
    }
    return data;
}

function setCached(path: string, data: any) {
    GET_CACHE[path] = {
        timestamp: Date.now(),
        data,
    };
}

function clearCache() {
    Object.keys(GET_CACHE).forEach((key) => delete GET_CACHE[key]);
}

/* ---------------------------------------------
   🔐 PROTECTED GET
---------------------------------------------- */
export async function protectedGet(path: string, navigate: any) {
    try {
        const cached = getCached(path);
        if (cached) return cached;

        const res = await apiFetch(path, { method: "GET" });
        setCached(path, res);
        return res;
    } catch (err: any) {
        if (err?.status === 401) navigate("/login");
        throw err;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED POST (JSON ONLY)
---------------------------------------------- */
export async function protectedPost(
    path: string,
    body: Record<string, any>,
    navigate: any
) {
    try {
        const res = await apiFetch(path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        clearCache();
        return res;
    } catch (err: any) {
        if (err?.status === 401) navigate("/login");
        throw err;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED POST MULTIPART (FILES)
---------------------------------------------- */
export async function protectedPostMultipart(
    path: string,
    formData: FormData,
    navigate: any
) {
    try {
        const res = await apiFetch(path, {
            method: "POST",
            body: formData, // ⚠️ DO NOT set Content-Type
        });

        clearCache();
        return res;
    } catch (err: any) {
        if (err?.status === 401) navigate("/login");
        throw err;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED PUT
---------------------------------------------- */
export async function protectedPut(
    path: string,
    body: Record<string, any>,
    navigate: any
) {
    try {
        const res = await apiFetch(path, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        clearCache();
        return res;
    } catch (err: any) {
        if (err?.status === 401) navigate("/login");
        throw err;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED DELETE
---------------------------------------------- */
export async function protectedDelete(path: string, navigate: any) {
    try {
        const res = await apiFetch(path, { method: "DELETE" });

        clearCache();
        return res;
    } catch (err: any) {
        if (err?.status === 401) navigate("/login");
        throw err;
    }
}