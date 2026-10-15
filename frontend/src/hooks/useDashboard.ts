import {
    useEffect,
    useState,
} from "react";

import {
    getDashboardSummary,
} from "@/services/dashboardService";

import type {
    DashboardSummary,
} from "@/types/dashboard";

export function useDashboard() {

    const [

        summary,

        setSummary

    ] =
        useState<DashboardSummary | null>(null);

    const [

        loading,

        setLoading

    ] =
        useState(true);

    const [

        error,

        setError

    ] =
        useState("");

    useEffect(() => {

        load();

    }, []);

    async function load() {

        try {

            setLoading(true);

            setError("");

            const data =
                await getDashboardSummary();

            setSummary(data);

        }
        catch (err) {

            console.error(err);

            setError(
                "Gagal mengambil dashboard."
            );

        }
        finally {

            setLoading(false);

        }

    }

    return {

        summary,

        loading,

        error,

        refresh: load,

    };

}