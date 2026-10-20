import axios from "axios";

export interface ApiErrorInfo {
    message: string;
    fieldErrors: Record<string, string>;
}

// Ambil pesan dan error per-kolom dari respons API (422/409/dst).
export function parseApiError(err: unknown, fallback: string): ApiErrorInfo {
    if (axios.isAxiosError(err) && err.response) {
        const data = err.response.data as {
            message?: string;
            errors?: Record<string, string>;
        } | undefined;

        return {
            message: data?.message || fallback,
            fieldErrors: data?.errors ?? {},
        };
    }

    return { message: fallback, fieldErrors: {} };
}
