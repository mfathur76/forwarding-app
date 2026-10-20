const rupiah = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
});

export function formatRupiah(value: number | null | undefined) {
    return rupiah.format(Number(value ?? 0));
}

// Tanggal dari API berupa tanggal-saja (tengah malam UTC), jadi tampilkan di UTC.
export function formatDate(value: string | null | undefined) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "UTC",
    });
}

// Untuk <input type="date">: yyyy-mm-dd
export function toDateInput(value: string | null | undefined) {
    return value ? value.slice(0, 10) : "";
}

export function todayInput(offsetDays = 0) {
    const date = new Date();

    date.setDate(date.getDate() + offsetDays);

    const pad = (n: number) => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
