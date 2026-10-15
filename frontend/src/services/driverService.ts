import { api } from "./api";

import type {
    Driver,
    DriverFormData,
} from "@/types/driver";

const BASE = "/drivers";

export async function getDrivers() {

    return await api.get<Driver[]>(BASE);

}

export async function getDriverById(
    id: string
) {

    return await api.get<Driver>(
        `${BASE}/${id}`
    );

}

export async function createDriver(
    data: DriverFormData
) {

    return await api.post<Driver>(
        BASE,
        data
    );

}

export async function updateDriver(
    id: string,
    data: DriverFormData
) {

    return await api.put<Driver>(
        `${BASE}/${id}`,
        data
    );

}

export async function deleteDriver(
    id: string
) {

    return await api.delete<void>(
        `${BASE}/${id}`
    );

}