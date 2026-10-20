import { useCallback, useEffect, useState } from "react";

import { parseApiError } from "@/utils/errors";

interface Options<T> {
    fetch: () => Promise<T[]>;
    remove: (id: string) => Promise<unknown>;
    match: (item: T, keyword: string) => boolean;
    label: string;
}

// Hook daftar generik: muat data, cari (di sisi klien), hapus dengan konfirmasi.
export function useList<T extends { id: string }>({
    fetch,
    remove,
    match,
    label,
}: Options<T>) {

    const [items, setItems] = useState<T[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [selected, setSelected] = useState<T | null>(null);

    const refresh = useCallback(async () => {

        try {
            setLoading(true);
            setError("");
            setItems(await fetch());
        }
        catch (err) {
            console.error(err);
            setError(parseApiError(err, `Gagal mengambil data ${label}.`).message);
        }
        finally {
            setLoading(false);
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    function flash(message: string) {
        setSuccess(message);
        setTimeout(() => setSuccess(""), 3000);
    }

    async function confirmDelete() {

        if (!selected) return;

        try {
            await remove(selected.id);
            setItems(prev => prev.filter(item => item.id !== selected.id));
            flash(`Data ${label} berhasil dihapus.`);
        }
        catch (err) {
            console.error(err);
            setError(parseApiError(err, `Gagal menghapus data ${label}.`).message);
        }
        finally {
            setSelected(null);
        }
    }

    // Muat ulang tanpa layar loading (mis. setelah ubah status).
    async function reload() {

        try {
            setItems(await fetch());
        }
        catch (err) {
            console.error(err);
            setError(parseApiError(err, `Gagal mengambil data ${label}.`).message);
        }
    }

    const keyword = query.trim().toLowerCase();

    const filtered = keyword
        ? items.filter(item => match(item, keyword))
        : items;

    return {
        items: filtered,
        reload,
        loading,
        error,
        setError,
        success,
        flash,
        query,
        setQuery,
        refresh,
        selected,
        requestDelete: setSelected,
        cancelDelete: () => setSelected(null),
        confirmDelete,
    };
}
