import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Printer, ArrowLeft } from "lucide-react";

import { getInvoiceById } from "@/services/invoiceService";
import { getShipmentById } from "@/services/shipmentService";
import { getCustomerById } from "@/services/customerService";

import type { Invoice } from "@/types/invoice";
import type { Shipment } from "@/types/shipment";
import type { Customer } from "@/types/customer";

import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { statusLabel } from "@/components/table/StatusBadge";

import { formatDate, formatRupiah } from "@/utils/format";

// Data perusahaan yang tampil di kop faktur. Ubah sesuai kebutuhan.
const COMPANY = {
    name: "PT RIZKI ABHIRAKA",
    tagline: "Trans Freight",
    address: "Alamat perusahaan",
    contact: "Telepon / Email perusahaan",
    payment: "Pembayaran ke rekening: (isi nama bank, nomor rekening, atas nama)",
};

export function InvoicePrintPage() {

    const { id } = useParams<{ id: string }>();

    const [data, setData] = useState<{
        invoice: Invoice;
        shipment: Shipment;
        customer: Customer;
    } | null>(null);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const invoice = await getInvoiceById(id!);
                const [shipment, customer] = await Promise.all([
                    getShipmentById(invoice.shipmentId),
                    getCustomerById(invoice.customerId),
                ]);
                setData({ invoice, shipment, customer });
            }
            catch {
                setError("Gagal memuat faktur.");
            }
        })();
    }, [id]);

    if (error) return <ErrorState message={error} />;
    if (!data) return <LoadingState />;

    const { invoice, shipment, customer } = data;

    return (

        <div className="min-h-screen bg-zinc-100 py-8 print:bg-white print:py-0">

            <div className="mx-auto mb-4 flex max-w-3xl justify-between print:hidden">

                <Link to="/invoices" className="btn-secondary flex items-center gap-2">
                    <ArrowLeft size={18} /> Kembali
                </Link>

                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={() => window.print()}
                >
                    <Printer size={18} /> Cetak / Simpan PDF
                </button>

            </div>

            <div className="mx-auto max-w-3xl bg-white p-10 shadow print:max-w-none print:p-0 print:shadow-none">

                <div className="flex items-start justify-between border-b-2 border-zinc-800 pb-6">

                    <div>
                        <h1 className="text-2xl font-bold">{COMPANY.name}</h1>
                        <p className="text-sm uppercase tracking-widest text-zinc-500">{COMPANY.tagline}</p>
                        <p className="mt-2 text-sm text-zinc-600">{COMPANY.address}</p>
                        <p className="text-sm text-zinc-600">{COMPANY.contact}</p>
                    </div>

                    <div className="text-right">
                        <h2 className="text-3xl font-bold tracking-wide">FAKTUR</h2>
                        <p className="mt-1 font-mono text-sm">{invoice.invoiceNumber}</p>
                        <p className="mt-2 text-sm font-semibold">{statusLabel(invoice.paymentStatus)}</p>
                    </div>

                </div>

                <div className="mt-6 grid grid-cols-2 gap-6 text-sm">

                    <div>
                        <p className="text-xs uppercase text-zinc-500">Ditagihkan kepada</p>
                        <p className="mt-1 font-semibold">{customer.name}</p>
                        {customer.company && <p>{customer.company}</p>}
                        <p className="whitespace-pre-line">{customer.address}</p>
                        <p>{customer.phone}</p>
                        <p>{customer.email}</p>
                    </div>

                    <div className="text-right">
                        <p><span className="text-zinc-500">Tanggal terbit: </span>{formatDate(invoice.issuedDate)}</p>
                        <p><span className="text-zinc-500">Jatuh tempo: </span>{formatDate(invoice.dueDate)}</p>
                    </div>

                </div>

                <table className="mt-8 w-full text-sm">

                    <thead>
                        <tr className="border-y border-zinc-300 bg-zinc-50 text-left">
                            <th className="px-3 py-2">Deskripsi</th>
                            <th className="px-3 py-2 text-right">Jumlah</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="border-b border-zinc-200 align-top">
                            <td className="px-3 py-3">
                                <p className="font-semibold">Jasa pengiriman {shipment.trackingNumber}</p>
                                <p>{shipment.origin} → {shipment.destination}</p>
                                <p className="text-zinc-500">
                                    {shipment.weightKg.toLocaleString("id-ID")} kg
                                    {shipment.cargoDescription ? ` · ${shipment.cargoDescription}` : ""}
                                </p>
                                <p className="text-zinc-500">
                                    Pickup {formatDate(shipment.pickupDate)} · Antar {formatDate(shipment.deliveryDate)}
                                </p>
                            </td>
                            <td className="px-3 py-3 text-right">{formatRupiah(invoice.amount)}</td>
                        </tr>
                    </tbody>

                </table>

                <div className="ml-auto mt-4 w-64 text-sm">
                    <div className="flex justify-between py-1">
                        <span className="text-zinc-500">Subtotal</span>
                        <span>{formatRupiah(invoice.amount)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                        <span className="text-zinc-500">Pajak</span>
                        <span>{formatRupiah(invoice.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t-2 border-zinc-800 py-2 text-lg font-bold">
                        <span>Total</span>
                        <span>{formatRupiah(invoice.total)}</span>
                    </div>
                </div>

                {invoice.notes && (
                    <p className="mt-6 text-sm"><span className="text-zinc-500">Catatan: </span>{invoice.notes}</p>
                )}

                <p className="mt-10 border-t border-zinc-200 pt-4 text-sm text-zinc-600">
                    {COMPANY.payment}
                </p>

            </div>

        </div>

    );

}
