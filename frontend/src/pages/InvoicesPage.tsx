import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useList } from "@/hooks/useList";

import {
    getInvoices,
    deleteInvoice,
    updateInvoiceStatus,
} from "@/services/invoiceService";
import { getCustomers } from "@/services/customerService";

import type { Invoice, PaymentStatus } from "@/types/invoice";

import { DataTable, Column } from "@/components/table/DataTable";
import { StatusSelect } from "@/components/table/StatusSelect";
import { TableActions } from "@/components/table/TableActions";

import { ListToolbar } from "@/components/ui/ListToolbar";
import { Banner } from "@/components/ui/Banner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

import { formatDate, formatRupiah } from "@/utils/format";
import { parseApiError } from "@/utils/errors";

const STATUSES: PaymentStatus[] = [
    "BELUM_BAYAR",
    "SEBAGIAN",
    "LUNAS",
    "LEWAT_JATUH_TEMPO",
];

export function InvoicesPage() {

    const navigate = useNavigate();

    const [customerNames, setCustomerNames] =
        useState<Record<string, string>>({});

    const {
        items,
        loading,
        error,
        setError,
        success,
        flash,
        query,
        setQuery,
        refresh,
        reload,
        selected,
        requestDelete,
        confirmDelete,
        cancelDelete,
    } = useList<Invoice>({
        fetch: getInvoices,
        remove: deleteInvoice,
        label: "faktur",
        match: (i, keyword) =>
            i.invoiceNumber.toLowerCase().includes(keyword) ||
            (customerNames[i.customerId] ?? "").toLowerCase().includes(keyword),
    });

    useEffect(() => {
        getCustomers()
            .then((customers) =>
                setCustomerNames(
                    Object.fromEntries(customers.map((c) => [c.id, c.name]))
                )
            )
            .catch(console.error);
    }, []);

    async function changeStatus(invoice: Invoice, status: PaymentStatus) {

        if (status === invoice.paymentStatus) return;

        try {
            await updateInvoiceStatus(invoice.id, status);
            flash(`Status ${invoice.invoiceNumber} diperbarui.`);
            await reload();
        }
        catch (err) {
            setError(parseApiError(err, "Gagal mengubah status pembayaran.").message);
        }
    }

    const columns = useMemo<Column<Invoice>[]>(() => [

        { key: "invoiceNumber", title: "No. Faktur" },

        {
            key: "customerId",
            title: "Pelanggan",
            render: (i) => <span>{customerNames[i.customerId] ?? "-"}</span>,
        },

        {
            key: "issuedDate",
            title: "Terbit",
            render: (i) => <span>{formatDate(i.issuedDate)}</span>,
        },

        {
            key: "dueDate",
            title: "Jatuh Tempo",
            render: (i) => <span>{formatDate(i.dueDate)}</span>,
        },

        {
            key: "total",
            title: "Total",
            align: "right",
            render: (i) => <span>{formatRupiah(i.total)}</span>,
        },

        {
            key: "paymentStatus",
            title: "Pembayaran",
            render: (i) => (
                <StatusSelect<PaymentStatus>
                    value={i.paymentStatus}
                    options={STATUSES}
                    onChange={(status) => changeStatus(i, status)}
                />
            ),
        },

        {
            key: "action",
            title: "",
            width: "110px",
            align: "center",
            render: (i) => (
                <TableActions
                    onEdit={() => navigate(`/invoices/${i.id}/edit`)}
                    onDelete={() => requestDelete(i)}
                />
            ),
        },

    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [navigate, requestDelete, customerNames]);

    if (loading) return <LoadingState />;

    if (error && items.length === 0) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (

        <div className="space-y-6">

            <ListToolbar
                title="Faktur"
                subtitle="Kelola faktur dan status pembayaran."
                placeholder="Cari no. faktur, pelanggan..."
                query={query}
                onQueryChange={setQuery}
                onRefresh={refresh}
                onAdd={() => navigate("/invoices/new")}
            />

            {success && <Banner type="success">{success}</Banner>}
            {error && <Banner type="error">{error}</Banner>}

            {items.length === 0 ? (
                <EmptyState message="Belum ada data faktur." />
            ) : (
                <DataTable<Invoice> columns={columns} rows={items} rowKey="id" />
            )}

            <ConfirmDialog
                open={selected !== null}
                title="Hapus Faktur"
                message={`Apakah Anda yakin ingin menghapus "${selected?.invoiceNumber}" ?`}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />

        </div>

    );

}
