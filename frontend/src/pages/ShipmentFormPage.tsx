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
import { statusLabel } from "@/components/table/StatusBadge";

import { useEntityForm } from "@/hooks/useEntityForm";

import {
    createShipment,
    getShipmentById,
    updateShipment,
} from "@/services/shipmentService";
import { getCustomers } from "@/services/customerService";
import { getDrivers } from "@/services/driverService";
import { getVehicles } from "@/services/vehicleService";

import type { Customer } from "@/types/customer";
import type { Driver } from "@/types/driver";
import type { Vehicle } from "@/types/vehicle";
import type { ShipmentStatus } from "@/types/shipment";

import { toDateInput } from "@/utils/format";

interface ShipmentForm {
    customerId: string;
    driverId: string;
    vehicleId: string;
    origin: string;
    destination: string;
    weightKg: string;
    price: string;
    pickupDate: string;
    deliveryDate: string;
    cargoDescription: string;
    notes: string;
    status: ShipmentStatus;
}

const initial: ShipmentForm = {
    customerId: "",
    driverId: "",
    vehicleId: "",
    origin: "",
    destination: "",
    weightKg: "",
    price: "",
    pickupDate: "",
    deliveryDate: "",
    cargoDescription: "",
    notes: "",
    status: "MENUNGGU",
};

export function ShipmentFormPage() {

    const { id } = useParams<{ id: string }>();

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [optionsError, setOptionsError] = useState("");

    useEffect(() => {
        Promise.all([getCustomers(), getDrivers(), getVehicles()])
            .then(([c, d, v]) => {
                setCustomers(c);
                setDrivers(d);
                setVehicles(v);
            })
            .catch(() => setOptionsError("Gagal memuat daftar pelanggan, pengemudi, dan kendaraan."));
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
    } = useEntityForm<ShipmentForm>({
        id,
        initial,
        backTo: "/shipments",
        label: "pengiriman",
        load: async (shipmentId) => {
            const s = await getShipmentById(shipmentId);

            return {
                customerId: s.customerId,
                driverId: s.driverId ?? "",
                vehicleId: s.vehicleId ?? "",
                origin: s.origin,
                destination: s.destination,
                weightKg: String(s.weightKg),
                price: String(s.price),
                pickupDate: toDateInput(s.pickupDate),
                deliveryDate: toDateInput(s.deliveryDate),
                cargoDescription: s.cargoDescription ?? "",
                notes: s.notes ?? "",
                status: s.status,
            };
        },
        save: (data, shipmentId) => {
            const payload = {
                ...data,
                weightKg: Number(data.weightKg || 0),
                price: Number(data.price || 0),
            };

            return shipmentId
                ? updateShipment(shipmentId, payload)
                : createShipment(payload);
        },
    });

    if (isLoading) return <LoadingState />;

    const set = (patch: Partial<ShipmentForm>) =>
        setFormData({ ...formData, ...patch });

    // Hanya pengemudi/kendaraan yang tersedia (ditambah yang sudah terpilih) bisa dipilih.
    const driverOptions = drivers
        .filter((d) => d.status === "TERSEDIA" || d.id === formData.driverId)
        .map((d) => ({
            value: d.id,
            label: `${d.name} (${statusLabel(d.status)})`,
        }));

    const vehicleOptions = vehicles
        .filter((v) => v.status === "TERSEDIA" || v.id === formData.vehicleId)
        .map((v) => ({
            value: v.id,
            label: `${v.plateNumber} - ${v.vehicleType} (${statusLabel(v.status)})`,
        }));

    return (

        <div className="space-y-6">

            <PageHeader
                title={isEdit ? "Edit Pengiriman" : "Tambah Pengiriman"}
                subtitle="Lengkapi informasi pengiriman."
            />

            {error && <Banner type="error">{error}</Banner>}
            {optionsError && <Banner type="error">{optionsError}</Banner>}

            <Card className="p-8">

                <form onSubmit={handleSubmit} className="space-y-8">

                    <FormSection
                        title="Pelanggan & Armada"
                        description="Pilih pelanggan, pengemudi, dan kendaraan."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <div className="md:col-span-2">
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

                            <Select
                                label="Pengemudi"
                                value={formData.driverId}
                                onChange={(e) => set({ driverId: e.target.value })}
                                error={fieldErrors.driverId}
                                options={[{ value: "", label: "Belum ditentukan" }, ...driverOptions]}
                            />

                            <Select
                                label="Kendaraan"
                                value={formData.vehicleId}
                                onChange={(e) => set({ vehicleId: e.target.value })}
                                error={fieldErrors.vehicleId}
                                options={[{ value: "", label: "Belum ditentukan" }, ...vehicleOptions]}
                            />

                        </div>

                    </FormSection>

                    <FormSection
                        title="Detail Pengiriman"
                        description="Rute, jadwal, muatan, dan harga."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <TextField
                                label="Asal"
                                value={formData.origin}
                                onChange={(e) => set({ origin: e.target.value })}
                                error={fieldErrors.origin}
                                required
                            />

                            <TextField
                                label="Tujuan"
                                value={formData.destination}
                                onChange={(e) => set({ destination: e.target.value })}
                                error={fieldErrors.destination}
                                required
                            />

                            <TextField
                                label="Tanggal Pickup"
                                type="date"
                                value={formData.pickupDate}
                                onChange={(e) => set({ pickupDate: e.target.value })}
                                error={fieldErrors.pickupDate}
                            />

                            <TextField
                                label="Tanggal Antar"
                                type="date"
                                min={formData.pickupDate || undefined}
                                value={formData.deliveryDate}
                                onChange={(e) => set({ deliveryDate: e.target.value })}
                                error={fieldErrors.deliveryDate}
                            />

                            <TextField
                                label="Berat (kg)"
                                type="number"
                                min={0}
                                value={formData.weightKg}
                                onChange={(e) => set({ weightKg: e.target.value })}
                                error={fieldErrors.weightKg}
                                required
                            />

                            <TextField
                                label="Harga (Rp)"
                                type="number"
                                min={0}
                                value={formData.price}
                                onChange={(e) => set({ price: e.target.value })}
                                error={fieldErrors.price}
                                required
                            />

                        </div>

                        <TextField
                            label="Deskripsi Muatan"
                            value={formData.cargoDescription}
                            onChange={(e) => set({ cargoDescription: e.target.value })}
                        />

                        <TextArea
                            label="Catatan"
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => set({ notes: e.target.value })}
                        />

                        {isEdit && (
                            <p className="text-sm text-zinc-500">
                                Status saat ini: <strong>{statusLabel(formData.status)}</strong>.
                                Ubah status lewat halaman daftar pengiriman.
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
