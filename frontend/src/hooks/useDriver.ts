import { useEffect, useMemo, useState } from "react";

import {
    getDrivers,
    deleteDriver,
} from "@/services/driverService";

import type { Driver } from "@/types/driver";

export function useDriver() {

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [query, setQuery] = useState("");

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [selectedDriver, setSelectedDriver] =
        useState<Driver | null>(null);

    useEffect(() => {

        loadDrivers();

    }, []);

    async function loadDrivers() {

        try {

            setLoading(true);

            setError("");

            const data = await getDrivers();

            setDrivers(data);

        }
        catch (err) {

            console.error(err);

            setError("Gagal mengambil data pelanggan.");

        }
        finally {

            setLoading(false);

        }

    }

    function requestDelete(driver: Driver) {

        setSelectedDriver(driver);

    }

    function cancelDelete() {

        setSelectedDriver(null);

    }

    async function confirmDelete() {

        if (!selectedDriver) return;

        try {

            await deleteDriver(selectedDriver.id);

            setDrivers(prev =>
                prev.filter(c => c.id !== selectedDriver.id)
            );

            setSuccess("Driver berhasil dihapus.");

            setTimeout(() => {

                setSuccess("");

            }, 3000);

        }
        catch (err) {

            console.error(err);

            setError("Gagal menghapus driver.");

        }
        finally {

            setSelectedDriver(null);

        }
    }
  //}

    const filteredDrivers = useMemo(() => {

        if (!query.trim()) {

            return drivers;

        }

        const keyword = query.toLowerCase();

        return drivers.filter(c =>

            c.name.toLowerCase().includes(keyword) ||

            c.licenseNumber.toLowerCase().includes(keyword) ||

            c.phone?.toLowerCase().includes(keyword) ||

            c.address?.toLowerCase().includes(keyword)

        );

    }, [drivers, query]);

    return {

        drivers: filteredDrivers,

        loading,

        error,

        success,

        query,

        setQuery,

        refresh: loadDrivers,

        requestDelete,

        confirmDelete,

        cancelDelete,

        selectedDriver,

    };

}