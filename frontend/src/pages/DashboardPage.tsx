import {
    Package,
    Users,
    Truck,
    UserRound,
} from "lucide-react";

import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueCard } from "@/components/dashboard/RevenueCard";
import { ShipmentStatusCard } from "@/components/dashboard/ShipmentStatusCard";

import { useDashboard } from "@/hooks/useDashboard";
import { DataTable } from "@/components/table/DataTable";
import { StatusBadge } from "@/components/table/StatusBadge";
import { ShipmentRow } from "@/types/dashboard";

export function DashboardPage() {
    const shipmentColumns = [

        {
            key: "trackingNumber",
            title: "Tracking",
        },

        {
            key: "customer",
            title: "Customer",
        },

        {
            key: "origin",
            title: "Origin",
        },

        {
            key: "destination",
            title: "Destination",
        },

        {
            key: "driver",
            title: "Driver",
        },

        {
            key: "vehicle",
            title: "Vehicle",
        },

        {
            key: "status",
            title: "Status",

            render: (row: ShipmentRow) => (

                <StatusBadge

                    status={row.status}

                />

            )

        },

        {
            key: "eta",
            title: "ETA",
        }

    ];
    const iconMap = {
        package: Package,
        users: Users,
        truck: Truck,
        driver: UserRound,
    };
    const {
        summary,
        loading,
        error,
        refresh,
    } = useDashboard();

    if (loading) {
        return <LoadingState />;
    }

    if (error || !summary) {
        return (
            <ErrorState
                message={error || "Dashboard tidak dapat dimuat."}
                onRetry={refresh}
            />
        );
    }

    return (

        <div className="space-y-8">

            <PageHeader
                title="Dashboard Operasional"
                subtitle="Ringkasan aktivitas forwarding hari ini."
            />

            {/* KPI */}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

                {summary.kpis.map((kpi) => {

                    const Icon =
                        iconMap[
                            kpi.icon as keyof typeof iconMap
                        ] ?? Package;

                    return (

                        <StatCard
                            key={kpi.key}
                            label={kpi.title}
                            value={kpi.value}
                            subtitle={kpi.subtitle}
                            icon={Icon}
                        />

                    );

                })}

            </div>

            {/* CONTENT */}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

                {/* LEFT */}

                <div className="xl:col-span-8">

                    <DataTable

                        columns={shipmentColumns}

                        rows={summary.latestShipments}

                        rowKey="id"

                    />

                </div>

                {/* RIGHT */}

                <div className="space-y-6 xl:col-span-4">

                    <RevenueCard
                        paid={summary.finance.paidRevenue}
                        outstanding={summary.finance.outstandingRevenue}
                    />

                    <ShipmentStatusCard
                        status={summary.shipmentStatus}
                    />

                </div>

            </div>

        </div>

    );

}