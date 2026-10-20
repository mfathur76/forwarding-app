import { api } from "./api";

import type {
    Invoice,
    InvoicePayload,
    PaymentStatus,
} from "@/types/invoice";

const BASE = "/invoices";

export const getInvoices = () => api.get<Invoice[]>(BASE);

export const getInvoiceById = (id: string) =>
    api.get<Invoice>(`${BASE}/${id}`);

export const createInvoice = (data: InvoicePayload) =>
    api.post<Invoice>(BASE, data);

export const updateInvoice = (id: string, data: InvoicePayload) =>
    api.put<Invoice>(`${BASE}/${id}`, data);

export const updateInvoiceStatus = (id: string, paymentStatus: PaymentStatus) =>
    api.patch<Invoice>(`${BASE}/${id}/status`, { paymentStatus });

export const deleteInvoice = (id: string) =>
    api.delete<void>(`${BASE}/${id}`);
