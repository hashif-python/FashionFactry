// src/lib/phone.ts

// Converts (country code + local number) to E.164 format
export function toE164(countryCode: string, local: string) {
    const cc = countryCode.replace(/\D/g, "");
    const digits = local.replace(/\D/g, "");

    if (!cc || !digits) return "";
    return `+${cc}${digits}`;
}
