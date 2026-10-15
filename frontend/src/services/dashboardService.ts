import { api } from "./api";
import type {
    DashboardSummary,
    DashboardKpi,
    ShipmentRow,
    ShipmentStatus,
} from "@/types/dashboard";

interface DashboardApiResponse {

    metrics: {
        totalShipments: number;
        totalCustomers: number;
        totalDrivers: number;
        totalVehicles: number;
        paidRevenue: number;
        outstandingRevenue: number;
    };

    latestShipments: {
        trackingNumber: string;
        route: string;
        status: string;
        createdAt: string;
    }[];

    shipmentStatuses: {
        status: string;
        total: number;
    }[];

}

export async function getDashboardSummary(): Promise<DashboardSummary> {

    const response =
        await api.get<DashboardApiResponse>(
            "/dashboard/summary"
        );

    const data = response;

    const kpis: DashboardKpi[] = [

        {
            key: "shipment",
            title: "Total Shipment",
            value: data.metrics.totalShipments,
            subtitle: "Seluruh pengiriman",
            icon: "package",
        },

        {
            key: "customer",
            title: "Customer",
            value: data.metrics.totalCustomers,
            subtitle: "Pelanggan aktif",
            icon: "users",
        },

        {
            key: "vehicle",
            title: "Vehicle",
            value: data.metrics.totalVehicles,
            subtitle: "Armada",
            icon: "truck",
        },

        {
            key: "driver",
            title: "Driver",
            value: data.metrics.totalDrivers,
            subtitle: "Driver aktif",
            icon: "driver",
        },

    ];

    const shipmentStatus: ShipmentStatus[] =
        data.shipmentStatuses.map(item => ({

            label: item.status,

            value: item.total,

        }));

    const latestShipments: ShipmentRow[] =
        data.latestShipments.map((item, index) => {

            const parts =
                item.route.split(" -> ");

            return {

                id: String(index + 1),

                trackingNumber:
                    item.trackingNumber,

                customer: "-",

                origin:
                    parts[0] ?? "-",

                destination:
                    parts[1] ?? "-",

                driver: "-",

                vehicle: "-",

                status:
                    mapStatus(item.status),

                eta:
                    new Date(item.createdAt)
                        .toLocaleDateString("id-ID"),

                updatedAt:
                    item.createdAt,

            };

        });

    return {

        kpis,

        finance: {

            paidRevenue:
                data.metrics.paidRevenue,

            outstandingRevenue:
                data.metrics.outstandingRevenue,

            paidInvoices: 0,

            outstandingInvoices: 0,

        },

        shipmentStatus,

        latestShipments,

    };

}

function mapStatus(status: string): ShipmentRow["status"] {

    switch (status) {

        case "TERKIRIM":
            return "Delivered";

        case "DALAM_PERJALANAN":
            return "On Route";

        case "MENUNGGU":
            return "Waiting";

        default:
            return "Waiting";

    }

}