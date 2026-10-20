interface Props {

    status: string;

}

const styles: Record<string, { label: string; className: string }> = {

    // Pengemudi / kendaraan
    TERSEDIA: { label: "Tersedia", className: "bg-green-100 text-green-700" },
    BERTUGAS: { label: "Bertugas", className: "bg-blue-100 text-blue-700" },
    PERAWATAN: { label: "Perawatan", className: "bg-yellow-100 text-yellow-700" },
    NONAKTIF: { label: "Nonaktif", className: "bg-zinc-200 text-zinc-600" },

    // Pengiriman
    MENUNGGU: { label: "Menunggu", className: "bg-yellow-100 text-yellow-700" },
    DALAM_PERJALANAN: { label: "Dalam Perjalanan", className: "bg-blue-100 text-blue-700" },
    TERKIRIM: { label: "Terkirim", className: "bg-green-100 text-green-700" },
    DIBATALKAN: { label: "Dibatalkan", className: "bg-red-100 text-red-700" },

    // Faktur
    BELUM_BAYAR: { label: "Belum Bayar", className: "bg-yellow-100 text-yellow-700" },
    SEBAGIAN: { label: "Sebagian", className: "bg-blue-100 text-blue-700" },
    LUNAS: { label: "Lunas", className: "bg-green-100 text-green-700" },
    LEWAT_JATUH_TEMPO: { label: "Lewat Jatuh Tempo", className: "bg-red-100 text-red-700" },

};

export function StatusBadge({

    status

}: Props) {

    const style = styles[status] ?? {
        label: status,
        className: "bg-zinc-100 text-zinc-700",
    };

    return (

        <span
            className={`
                inline-block
                whitespace-nowrap
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${style.className}
            `}
        >

            {style.label}

        </span>

    );

}

export function statusLabel(status: string) {
    return styles[status]?.label ?? status;
}
