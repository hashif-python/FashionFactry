import { apiFetch } from "./api";

/* ------------------------------------------
   PROTECTED GET
------------------------------------------- */
export async function protectedGet(path: string, navigate: any) {
    try {
        return await apiFetch(path, { method: "GET" });
    } catch (e: any) {
        if (e.status === 401) navigate("/login");
        return null;
    }
}

/* ------------------------------------------
   PROTECTED POST (JSON)
------------------------------------------- */
export async function protectedPost(
    path: string,
    body: any = {},
    navigate: any
) {
    try {
        return await apiFetch(path, {
            method: "POST",
            body: JSON.stringify(body),
        });
    } catch (e: any) {
        if (e.status === 401) navigate("/login");
        return null;
    }
}

/* ------------------------------------------
   PROTECTED PUT (JSON)
------------------------------------------- */
export async function protectedPut(
    path: string,
    body: any = {},
    navigate: any
) {
    try {
        return await apiFetch(path, {
            method: "PUT",
            body: JSON.stringify(body),
        });
    } catch (e: any) {
        if (e.status === 401) navigate("/login");
        return null;
    }
}

/* ------------------------------------------
   PROTECTED DELETE
------------------------------------------- */
export async function protectedDelete(path: string, navigate: any) {
    try {
        return await apiFetch(path, { method: "DELETE" });
    } catch (e: any) {
        if (e.status === 401) navigate("/login");
        return null;
    }
}

/* ------------------------------------------
   PROTECTED POST MULTIPART (FormData)
------------------------------------------- */
export async function protectedPostMultipart(
    path: string,
    formData: FormData,
    navigate: any
) {
    try {
        return await apiFetch(path, {
            method: "POST",
            body: formData,
        });
    } catch (e: any) {
        if (e.status === 401) navigate("/login");
        return null;
    }
}
