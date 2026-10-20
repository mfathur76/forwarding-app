import { api } from "./api";

import type { Vehicle, VehiclePayload } from "@/types/vehicle";

const BASE = "/vehicles";

export const getVehicles = () => api.get<Vehicle[]>(BASE);

export const getVehicleById = (id: string) =>
    api.get<Vehicle>(`${BASE}/${id}`);

export const createVehicle = (data: VehiclePayload) =>
    api.post<Vehicle>(BASE, data);

export const updateVehicle = (id: string, data: VehiclePayload) =>
    api.put<Vehicle>(`${BASE}/${id}`, data);

export const deleteVehicle = (id: string) =>
    api.delete<void>(`${BASE}/${id}`);
