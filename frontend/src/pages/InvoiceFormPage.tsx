import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormActions } from "@/components/ui/FormActions";
import { TextField } from "@/components/ui/TextField";
import { TextArea } from "@/components/ui/TextArea";
import { Select } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/LoadingState";
import { Banner } from "@/components/ui/Banner";

import { useEntityForm } from "@/hooks/useEntityForm";

import {
    createInvoice,
    getInvoiceById,
    getInvoices,
    updateInvoice,
} from "@/services/invoiceService";
import { getShipments } from "@/services/shipmentService";
import { getCustomers } from "@/services/customerService";

import type { Customer } from "@/types/customer";
import type { Shipment } from "@/types/shipment";
import type { PaymentStatus } from "@/types/invoice";

import { formatRupiah, toDateInput, todayInput } from "@/utils/format";

interface InvoiceForm {
    customerId: string;
    shipmentId: string;
    issuedDate: string;
    dueDate: string;
    amount: string;
    tax: string;
    notes: string;
    paymentStatus: PaymentStatus;
}

const initial: InvoiceForm = {
    customerId: "",
    shipmentId: "",
    issuedDate: todayInput(),
    dueDate: todayInput(30),
    amount: "",
    tax: "0",
    notes: "",
    paymentStatus: "BELUM_BAYAR",
};

export function InvoiceFormPage() {

    const { id } = useParams<{ id: string }>();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [invoicedShipmentIds, setInvoicedShipmentIds] = useState<Set<string>>(new Set());
    const [optionsError, setOptionsError] = useState("");

    useEffect(() => {
        Promise.all([getCustomers(), getShipments(), getInvoices()])
            .then(([c, s, i]) => {
                setCustomers(c);
                setShipments(s);
                setInvoicedShipmentIds(new Set(i.map((inv) => inv.shipmentId)));
            })
            .catch(() => setOptionsError("Gagal memuat daftar pelanggan dan pengiriman."));
    }, []);

    const {
        formData,
        setFormData,
        handleSubmit,
        handleCancel,
        isLoading,
        isSubmitting,
        error,
        fieldErrors,
        isEdit,
    } = useEntityForm<InvoiceForm>({
        id,
        initial,
        backTo: "/invoices",
        label: "faktur",
        load: async (invoiceId) => {
            const inv = await getInvoiceById(invoiceId);

            return {
                customerId: inv.customerId,
                shipmentId: inv.shipmentId,
                issuedDate: toDateInput(inv.issuedDate),
                dueDate: toDateInput(inv.dueDate),
                amount: String(inv.amount),
                tax: String(inv.tax),
                notes: inv.notes ?? "",
                paymentStatus: inv.paymentStatus,
            };
        },
        save: (data, invoiceId) => {
            const payload = {
                ...data,
                amount: Number(data.amount || 0),
                tax: Number(data.tax || 0),
            };

            return invoiceId
                ? updateInvoice(invoiceId, payload)
                : createInvoice(payload);
        },
    });

    if (isLoading) return <LoadingState />;

    const set = (patch: Partial<InvoiceForm>) =>
        setFormData({ ...formData, ...patch });

    // Pilih pengiriman -> pelanggan dan jumlah terisi otomatis dari pengiriman.
    function selectShipment(shipmentId: string) {

        const shipment = shipments.find((s) => s.id === shipmentId);

        set({
            shipmentId,
            customerId: shipment?.customerId ?? formData.customerId,
            amount: shipment ? String(shipment.price) : formData.amount,
        });
    }

    const customerName = (customerId: string) =>
        customers.find((c) => c.id === customerId)?.name ?? "-";

    // Satu pengiriman hanya boleh punya satu faktur.
    const shipmentOptions = shipments
        .filter((s) => s.status !== "DIBATALKAN")
        .filter((s) => s.id === formData.shipmentId || !invoicedShipmentIds.has(s.id))
        .map((s) => ({
            value: s.id,
            label: `${s.trackingNumber} - ${customerName(s.customerId)} (${s.origin} → ${s.destination})`,
        }));

    const amount = Number(formData.amount || 0);
    const tax = Number(formData.tax || 0);

    return (

        <div className="space-y-6">

            <PageHeader
                title={isEdit ? "Edit Faktur" : "Tambah Faktur"}
                subtitle="Buat faktur dari pengiriman."
            />

            {error && <Banner type="error">{error}</Banner>}
            {optionsError && <Banner type="error">{optionsError}</Banner>}

            <Card className="p-8">

                <form onSubmit={handleSubmit} className="space-y-8">

                    <FormSection
                        title="Pengiriman"
                        description="Satu pengiriman hanya dapat memiliki satu faktur."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <div className="md:col-span-2">
                                <Select
                                    label="Pengiriman"
                                    value={formData.shipmentId}
                                    onChange={(e) => selectShipment(e.target.value)}
                                    error={fieldErrors.shipmentId}
                                    placeholder="Pilih pengiriman"
                                    options={shipmentOptions}
                                    required
                                />
                            </div>

                            <Select
                                label="Pelanggan"
                                value={formData.customerId}
                                onChange={(e) => set({ customerId: e.target.value })}
                                error={fieldErrors.customerId}
                                placeholder="Pilih pelanggan"
                                options={customers.map((c) => ({
                                    value: c.id,
                                    label: c.company ? `${c.name} - ${c.company}` : c.name,
                                }))}
                                required
                            />

                        </div>

                    </FormSection>

                    <FormSection
                        title="Tagihan"
                        description="Tanggal dan nominal faktur."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <TextField
                                label="Tanggal Terbit"
                                type="date"
                                value={formData.issuedDate}
                                onChange={(e) => set({ issuedDate: e.target.value })}
                                error={fieldErrors.issuedDate}
                                required
                            />

                            <TextField
                                label="Jatuh Tempo"
                                type="date"
                                min={formData.issuedDate || undefined}
                                value={formData.dueDate}
                                onChange={(e) => set({ dueDate: e.target.value })}
                                error={fieldErrors.dueDate}
                                required
                            />

                            <TextField
                                label="Jumlah (Rp)"
                                type="number"
                                min={0}
                                value={formData.amount}
                                onChange={(e) => set({ amount: e.target.value })}
                                error={fieldErrors.amount}
                                required
                            />

                            <div>
                                <TextField
                                    label="Pajak (Rp)"
                                    type="number"
                                    min={0}
                                    value={formData.tax}
                                    onChange={(e) => set({ tax: e.target.value })}
                                    error={fieldErrors.tax}
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-sm text-orange-600 hover:underline"
                                    onClick={() => set({ tax: String(Math.round(amount * 0.11)) })}
                                >
                                    Isi PPN 11%
                                </button>
                            </div>

                        </div>

                        <div className="rounded-lg bg-zinc-50 p-4 text-right">
                            <span className="text-sm text-zinc-500">Total: </span>
                            <span className="text-xl font-bold">
                                {formatRupiah(amount + tax)}
                            </span>
                        </div>

                        <TextArea
                            label="Catatan"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => set({ notes: e.target.value })}
                        />

                        {isEdit && (
                            <p className="text-sm text-zinc-500">
                                Status pembayaran diubah lewat halaman daftar faktur.
                            </p>
                        )}

                    </FormSection>

                    <FormActions
                        loading={isSubmitting}
                        submitLabel={isEdit ? "Update" : "Simpan"}
                        onCancel={handleCancel}
                    />

                </form>

            </Card>

        </div>

    );

}
