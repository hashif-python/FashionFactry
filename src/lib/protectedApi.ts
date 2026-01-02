import { apiFetch } from "./api";

/* ---------------------------------------------
   🔥 10-second GET Cache for Smooth UX
---------------------------------------------- */
const GET_CACHE: Record<string, any> = {};
const CACHE_TTL = 10_000; // 10 seconds

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

/* ---------------------------------------------
   🔐 PROTECTED GET
---------------------------------------------- */
export async function protectedGet(path: string, navigate: any) {
    try {
        // 1️⃣ FAST CACHE → skip API if data exists
        const cached = getCached(path);
        if (cached) return cached;

        // 2️⃣ Fresh data
        const res = await apiFetch(path, { method: "GET" });
        setCached(path, res);
        return res;
    } catch (err: any) {
        // Force logout on unauthorized
        if (err.status === 401) navigate("/login");
        return null;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED POST
---------------------------------------------- */
export async function protectedPost(
    path: string,
    body: any,
    navigate: any
) {
    try {
        const res = await apiFetch(path, {
            method: "POST",
            body: JSON.stringify(body),
        });

        // Clear GET cache after write
        Object.keys(GET_CACHE).forEach((key) => delete GET_CACHE[key]);

        return res;
    } catch (err: any) {
        // 🔐 Auth expired
        if (err?.status === 401) {
            navigate("/login");
        }

        // ✅ IMPORTANT: rethrow error so caller catch() gets it
        throw err;
    }
}


/* ---------------------------------------------
   🔐 PROTECTED PUT
---------------------------------------------- */
export async function protectedPut(path: string, body: any, navigate: any) {
    try {
        const res = await apiFetch(path, {
            method: "PUT",
            body: JSON.stringify(body),
        });

        Object.keys(GET_CACHE).forEach((key) => delete GET_CACHE[key]);

        return res;
    } catch (err: any) {
        if (err.status === 401) navigate("/login");
        return null;
    }
}

/* ---------------------------------------------
   🔐 PROTECTED DELETE
---------------------------------------------- */
export async function protectedDelete(path: string, navigate: any) {
    try {
        const res = await apiFetch(path, { method: "DELETE" });

        Object.keys(GET_CACHE).forEach((key) => delete GET_CACHE[key]);

        return res;
    } catch (err: any) {
        if (err.status === 401) navigate("/login");
        return null;
    }
}


/* ---------------------------------------------
   🔐 PROTECTED POST MULTIPART (for file uploads)
---------------------------------------------- */
export async function protectedPostMultipart(path: string, formData: FormData, navigate: any) {
    try {
        const res = await apiFetch(path, {
            method: "POST",
            body: formData,        // Do NOT set Content-Type → browser will set boundary
        });

        // Reset GET cache
        Object.keys(GET_CACHE).forEach((key) => delete GET_CACHE[key]);

        return res;
    } catch (err: any) {
        if (err.status === 401) navigate("/login");
        return null;
    }
}
