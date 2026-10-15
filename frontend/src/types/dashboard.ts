export interface DashboardSummary {
    kpis: DashboardKpi[];
    finance: FinanceSummary;
    shipmentStatus: ShipmentStatus[];
    latestShipments: ShipmentRow[];
}

export interface DashboardKpi {
    key: string;
    title: string;
    value: number;
    subtitle: string;
    icon: string;
}

export interface FinanceSummary {
    paidRevenue: number;
    outstandingRevenue: number;
    paidInvoices: number;
    outstandingInvoices: number;
}

export interface ShipmentStatus {
    label: string;
    value: number;
}

export interface ShipmentRow {
    id: string;

    trackingNumber: string;

    customer: string;

    origin: string;

    destination: string;

    driver: string;

    vehicle: string;

    status: "Waiting" | "On Route" | "Delivered" | "Cancelled";

    eta: string;

    updatedAt: string;
}