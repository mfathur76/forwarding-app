import { api } from "./api";

import type {
    Customer,
    CustomerFormData,
} from "@/types/customer";

const BASE = "/customers";

export async function getCustomers() {

    return await api.get<Customer[]>(BASE);

}

export async function getCustomerById(
    id: string
) {

    return await api.get<Customer>(
        `${BASE}/${id}`
    );

}

export async function createCustomer(
    data: CustomerFormData
) {

    return await api.post<Customer>(
        BASE,
        data
    );

}

export async function updateCustomer(
    id: string,
    data: CustomerFormData
) {

    return await api.put<Customer>(
        `${BASE}/${id}`,
        data
    );

}

export async function deleteCustomer(
    id: string
) {

    return await api.delete<void>(
        `${BASE}/${id}`
    );

}