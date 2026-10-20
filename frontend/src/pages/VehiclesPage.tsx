import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useList } from "@/hooks/useList";

import { getVehicles, deleteVehicle } from "@/services/vehicleService";

import type { Vehicle } from "@/types/vehicle";

import { DataTable, Column } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/table/StatusBadge";
import { TableActions } from "@/components/table/TableActions";

import { ListToolbar } from "@/components/ui/ListToolbar";
import { Banner } from "@/components/ui/Banner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export function VehiclesPage() {

    const navigate = useNavigate();

    const {
        items,
        loading,
        error,
        success,
        query,
        setQuery,
        refresh,
        selected,
        requestDelete,
        confirmDelete,
        cancelDelete,
    } = useList<Vehicle>({
        fetch: getVehicles,
        remove: deleteVehicle,
        label: "kendaraan",
        match: (v, keyword) =>
            v.plateNumber.toLowerCase().includes(keyword) ||
            v.vehicleType.toLowerCase().includes(keyword) ||
            (v.brand ?? "").toLowerCase().includes(keyword),
    });

    const columns = useMemo<Column<Vehicle>[]>(() => [

        { key: "plateNumber", title: "Plat Nomor" },

        { key: "vehicleType", title: "Tipe" },

        {
            key: "brand",
            title: "Merek",
            render: (v) => <span>{v.brand || "-"}</span>,
        },

        {
            key: "capacityKg",
            title: "Kapasitas",
            render: (v) => <span>{v.capacityKg.toLocaleString("id-ID")} kg</span>,
        },

        {
            key: "year",
            title: "Tahun",
            render: (v) => <span>{v.year ?? "-"}</span>,
        },

        {
            key: "status",
            title: "Status",
            render: (v) => <StatusBadge status={v.status} />,
        },

        {
            key: "action",
            title: "",
            width: "110px",
            align: "center",
            render: (v) => (
                <TableActions
                    onEdit={() => navigate(`/vehicles/${v.id}/edit`)}
                    onDelete={() => requestDelete(v)}
                />
            ),
        },

    ], [navigate, requestDelete]);

    if (loading) return <LoadingState />;

    if (error && items.length === 0) {
        return <ErrorState message={error} onRetry={refresh} />;
    }

    return (

        <div className="space-y-6">

            <ListToolbar
                title="Kendaraan"
                subtitle="Kelola armada kendaraan perusahaan."
                placeholder="Cari kendaraan..."
                query={query}
                onQueryChange={setQuery}
                onRefresh={refresh}
                onAdd={() => navigate("/vehicles/new")}
            />

            {success && <Banner type="success">{success}</Banner>}
            {error && <Banner type="error">{error}</Banner>}

            {items.length === 0 ? (
                <EmptyState message="Belum ada data kendaraan." />
            ) : (
                <DataTable<Vehicle> columns={columns} rows={items} rowKey="id" />
            )}

            <ConfirmDialog
                open={selected !== null}
                title="Hapus Kendaraan"
                message={`Apakah Anda yakin ingin menghapus "${selected?.plateNumber}" ?`}
                onCancel={cancelDelete}
                onConfirm={confirmDelete}
            />

        </div>

    );

}
