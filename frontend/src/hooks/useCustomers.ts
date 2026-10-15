import { useEffect, useMemo, useState } from "react";

import {
    getCustomers,
    deleteCustomer,
} from "@/services/customerService";

import type { Customer } from "@/types/customer";

export function useCustomers() {

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [query, setQuery] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [selectedCustomer, setSelectedCustomer] =
        useState<Customer | null>(null);

    useEffect(() => {

        loadCustomers();

    }, []);

    async function loadCustomers() {

        try {

            setLoading(true);

            setError("");

            const data = await getCustomers();

            setCustomers(data);

        }
        catch (err) {

            console.error(err);

            setError("Gagal mengambil data pelanggan.");

        }
        finally {

            setLoading(false);

        }

    }

    function requestDelete(customer: Customer) {

        setSelectedCustomer(customer);

    }

    function cancelDelete() {

        setSelectedCustomer(null);

    }

    async function confirmDelete() {

        if (!selectedCustomer) return;

        try {

            await deleteCustomer(selectedCustomer.id);

            setCustomers(prev =>
                prev.filter(c => c.id !== selectedCustomer.id)
            );

            setSuccess("Pelanggan berhasil dihapus.");

            setTimeout(() => {

                setSuccess("");

            }, 3000);

        }
        catch (err) {

            console.error(err);

            setError("Gagal menghapus pelanggan.");

        }
        finally {

            setSelectedCustomer(null);

        }

    }

    const filteredCustomers = useMemo(() => {

        if (!query.trim()) {

            return customers;

        }

        const keyword = query.toLowerCase();

        return customers.filter(c =>

            c.name.toLowerCase().includes(keyword) ||

            c.email.toLowerCase().includes(keyword) ||

            c.phone.toLowerCase().includes(keyword) ||

            c.address.toLowerCase().includes(keyword)

        );

    }, [customers, query]);

    return {

        customers: filteredCustomers,

        loading,

        error,

        success,

        query,

        setQuery,

        refresh: loadCustomers,

        requestDelete,

        confirmDelete,

        cancelDelete,

        selectedCustomer,

    };

}