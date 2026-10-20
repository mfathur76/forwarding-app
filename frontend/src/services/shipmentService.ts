import { api } from "./api";

import type {
    Shipment,
    ShipmentPayload,
    ShipmentStatus,
} from "@/types/shipment";

const BASE = "/shipments";

export const getShipments = () => api.get<Shipment[]>(BASE);

export const getShipmentById = (id: string) =>
    api.get<Shipment>(`${BASE}/${id}`);

export const createShipment = (data: ShipmentPayload) =>
    api.post<Shipment>(BASE, data);

export const updateShipment = (id: string, data: ShipmentPayload) =>
    api.put<Shipment>(`${BASE}/${id}`, data);

// Mengubah status juga memperbarui status pengemudi & kendaraan di server.
export const updateShipmentStatus = (id: string, status: ShipmentStatus) =>
    api.patch<Shipment>(`${BASE}/${id}/status`, { status });

export const deleteShipment = (id: string) =>
    api.delete<void>(`${BASE}/${id}`);
