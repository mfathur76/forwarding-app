import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useList } from "@/hooks/useList";

import {
    getShipments,
    deleteShipment,
    updateShipmentStatus,
} from "@/services/shipmentService";
import { getCustomers } from "@/services/customerService";

import type { Shipment, ShipmentStatus } from "@/types/shipment";

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

const STATUSES: ShipmentStatus[] = [
    "MENUNGGU",
    "DALAM_PERJALANAN",
    "TERKIRIM",
    "DIBATALKAN",
];

export function ShipmentsPage() {

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
    } = useList<Shipment>({
        fetch: getShipments,
        remove: deleteShipment,
        label: "pengiriman",
        match: (s, keyword) =>
            s.trackingNumber.toLowerCase().includes(keyword) ||
            s.origin.toLowerCase().includes(keyword) ||
            s.destination.toLowerCase().includes(keyword) ||
            (customerNames[s.customerId] ?? "").toLowerCase().includes(keyword),
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

    async function changeStatus(shipment: Shipment, status: ShipmentStatus) {

        if (status === shipment.status) return;

        try {
            await updateShipmentStatus(shipment.id, status);
            flash(`Status ${shipment.trackingNumber} diperbarui.`);
            await reload();
        }
        catch (err) {
            setError(parseApiError(err, "Gagal mengubah status pengiriman.").message);
        }
    }

    const columns = useMemo<Column<Shipment>[]>(() => [

        { key: "trackingNumber", title: "No. Lacak" },

        {
            key: "customerId",
            title: "Pelanggan",
            render: (s) => <span>{customerNames[s.customerId] ?? "-"}</span>,
        },

        {
            key: "route",
            title: "Rute",
            render: (s) => <span>{s.origin} → {s.destination}</span>,
        },

        {
            key: "pickupDate",
            title: "Pickup",
            render: (s) => <span>{formatDate(s.pickupDate)}</span>,
        },

        {
            key: "price",
            title: "Harga",
            align: "right",
            render: (s) => <span>{formatRupiah(s.price)}</span>,
        },

        {
            key: "status",
            title: "Status",
            render: (s) => (
                <StatusSelect<ShipmentStatus>
                    value={s.status}
                    options={STATUSES}
                    disabled={s.status === "TERKIRIM" || s.status === "DIBATALKAN"}
                    onChange={(status) => changeStatus(s, status)}
                />
            ),
        },

        {
            key: "action",
            title: "",
            width: "110px",
            align: "center",
            render: (s) => (
                <TableActions
                    onEdit={() => navigate(`/shipments/${s.id}/edit`)}
                    onDelete={() => requestDelete(s)}
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
                title="Pengiriman"
                subtitle="Kelola pengiriman barang dan pantau statusnya."
                placeholder="Cari no. lacak, rute..."
                query={query}
                onQueryChange={setQuery}
                onRefresh={refresh}
                onAdd={() => navigate("/shipments/new")}
            />

            {success && <Banner type="success">{success}</Banner>}
            {error && <Banner type="error">{error}</Banner>}

            {items.length === 0 ? (
                <EmptyState message="Belum ada data pengiriman." />
            ) : (
                <DataTable<Shipment> columns={columns} rows={items} rowKey="id" />
            )}

            <ConfirmDialog
                open={selected !== null}
                title="Hapus Pengiriman"
                message={`Apakah Anda yakin ingin menghapus "${selected?.trackingNumber}" ?`}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />

        </div>

    );

}
