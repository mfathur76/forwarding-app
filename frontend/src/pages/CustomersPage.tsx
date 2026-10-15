import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { useCustomers } from "@/hooks/useCustomers";

import type { Customer } from "@/types/customer";

import {
    DataTable,
    Column,
} from "@/components/table/DataTable";

import { TableActions } from "@/components/table/TableActions";
import { CustomerToolbar } from "@/components/customer/CustomerToolbar";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export function CustomersPage() {

    const navigate = useNavigate();

    const {

        customers,

        loading,

        error,

        success,

        query,

        setQuery,

        refresh,

        requestDelete,

        confirmDelete,

        cancelDelete,

        selectedCustomer,

    } = useCustomers();

    const columns = useMemo<Column<Customer>[]>(() => [

        {
            key: "name",
            title: "Nama"
        },

        {
            key: "company",
            title: "Perusahaan",
            render: (customer) => (
                <span>{customer.company || '-'}</span>
            )
        },

        {
            key: "email",
            title: "Email"
        },

        {
            key: "phone",
            title: "Telepon"
        },

        {
            key: "address",
            title: "Alamat"
        },

        {
            key: "action",
            title: "",
            width: "110px",
            align: "center",

            render: (customer) => (

                <TableActions

                    onEdit={() =>
                        navigate(`/customers/${customer.id}/edit`)
                    }

                    onDelete={() =>
                        requestDelete(customer)
                    }

                />

            )

        }

    ], [navigate, requestDelete]);

    if (loading) {

        return <LoadingState />;

    }

    if (error && customers.length === 0) {

        return (

            <ErrorState

                message={error}

                onRetry={refresh}

            />

        );

    }

    return (

        <div className="space-y-6">

            <CustomerToolbar

                query={query}

                onQueryChange={setQuery}

                onRefresh={refresh}

                onAdd={() =>
                    navigate("/customers/new")
                }

            />

            {success && (

                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">

                    {success}

                </div>

            )}

            {customers.length === 0 ? (

                <EmptyState
                    message="Belum ada data pelanggan."
                />

            ) : (

                <DataTable<Customer>

                    columns={columns}

                    rows={customers}

                    rowKey="id"

                />

            )}
          
            <ConfirmDialog

                open={selectedCustomer !== null}

                title="Hapus Pelanggan"

                message={`Apakah Anda yakin ingin menghapus "${selectedCustomer?.name}" ?`}

                onCancel={cancelDelete}

                onConfirm={confirmDelete}

            />

        </div>

    );

}