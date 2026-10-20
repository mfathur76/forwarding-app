export type PaymentStatus =
  | "BELUM_BAYAR"
  | "SEBAGIAN"
  | "LUNAS"
  | "LEWAT_JATUH_TEMPO";

export interface Invoice {
  id: string;

  invoiceNumber: string;
  customerId: string;
  shipmentId: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  total: number;
  paymentStatus: PaymentStatus;
  notes: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface InvoicePayload {
  customerId: string;
  shipmentId: string;
  issuedDate: string;
  dueDate: string;
  amount: number;
  tax: number;
  notes: string;
  paymentStatus: PaymentStatus;
}
