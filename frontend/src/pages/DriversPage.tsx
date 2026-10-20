import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useDriver } from "@/hooks/useDriver";

import type { Driver } from "@/types/driver";

import {
    DataTable,
    Column,
} from "@/components/table/DataTable";

import { TableActions } from "@/components/table/TableActions";
import { StatusBadge } from "@/components/table/StatusBadge";
import { DriverToolbar } from "@/components/driver/DriverToolbar";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export function DriversPage() {

    const navigate = useNavigate();

    const {

        drivers,

        loading,

        error,

        success,

        query,

        setQuery,

        refresh,

        requestDelete,

        confirmDelete,

        cancelDelete,

        selectedDriver,

    } = useDriver();

    const columns = useMemo<Column<Driver>[]>(() => [

        {
            key: "name",
            title: "Nama"
        },

        {
            key: "phone",
            title: "Telepon"
        },


        {
            key: "licenseNumber",
            title: "Nomor SIM"
        },

        {
            key: "status",
            title: "Status",
            render: (driver) => (
                <StatusBadge status={driver.status} />
            )
        },

        {
            key: "action",
            title: "",
            width: "110px",
            align: "center",

            render: (driver) => (

                <TableActions

                    onEdit={() =>
                        navigate(`/drivers/${driver.id}/edit`)
                    }

                    onDelete={() =>
                        requestDelete(driver)
                    }

                />

            )

        }

    ], [navigate, requestDelete]);

    if (loading) {

        return <LoadingState />;

    }

    if (error && drivers.length === 0) {

        return (

            <ErrorState

                message={error}

                onRetry={refresh}

            />

        );

    }

    return (

        <div className="space-y-6">

            <DriverToolbar

                query={query}

                onQueryChange={setQuery}

                onRefresh={refresh}

                onAdd={() =>
                    navigate("/drivers/new")
                }

            />

            {success && (

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

                    {success}

                </div>

            )}

            {drivers.length === 0 ? (

                <EmptyState
                    message="Belum ada data pengemudi."
                />

            ) : (

                <DataTable<Driver>

                    columns={columns}

                    rows={drivers}

                    rowKey="id"

                />

            )}
          
            <ConfirmDialog

                open={selectedDriver !== null}

                title="Hapus Pengemudi"

                message={`Apakah Anda yakin ingin menghapus "${selectedDriver?.name}" ?`}

                onCancel={cancelDelete}

                onConfirm={confirmDelete}

            />

        </div>

    );

}