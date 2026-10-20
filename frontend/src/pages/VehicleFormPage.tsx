import { useParams } from "react-router-dom";

import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormActions } from "@/components/ui/FormActions";
import { TextField } from "@/components/ui/TextField";
import { Select } from "@/components/ui/Select";
import { LoadingState } from "@/components/ui/LoadingState";
import { Banner } from "@/components/ui/Banner";

import { useEntityForm } from "@/hooks/useEntityForm";

import {
    createVehicle,
    getVehicleById,
    updateVehicle,
} from "@/services/vehicleService";

import type { VehicleStatus } from "@/types/vehicle";

interface VehicleForm {
    plateNumber: string;
    vehicleType: string;
    brand: string;
    capacityKg: string;
    year: string;
    status: VehicleStatus;
}

const initial: VehicleForm = {
    plateNumber: "",
    vehicleType: "",
    brand: "",
    capacityKg: "",
    year: "",
    status: "TERSEDIA",
};

export function VehicleFormPage() {

    const { id } = useParams<{ id: string }>();

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
    } = useEntityForm<VehicleForm>({
        id,
        initial,
        backTo: "/vehicles",
        label: "kendaraan",
        load: async (vehicleId) => {
            const v = await getVehicleById(vehicleId);

            return {
                plateNumber: v.plateNumber,
                vehicleType: v.vehicleType,
                brand: v.brand ?? "",
                capacityKg: String(v.capacityKg),
                year: v.year ? String(v.year) : "",
                status: v.status,
            };
        },
        save: (data, vehicleId) => {
            const payload = {
                plateNumber: data.plateNumber,
                vehicleType: data.vehicleType,
                brand: data.brand,
                capacityKg: Number(data.capacityKg || 0),
                year: data.year ? Number(data.year) : null,
                status: data.status,
            };

            return vehicleId
                ? updateVehicle(vehicleId, payload)
                : createVehicle(payload);
        },
    });

    if (isLoading) return <LoadingState />;

    const set = (patch: Partial<VehicleForm>) =>
        setFormData({ ...formData, ...patch });

    return (

        <div className="space-y-6">

            <PageHeader
                title={isEdit ? "Edit Kendaraan" : "Tambah Kendaraan"}
                subtitle="Lengkapi informasi kendaraan."
            />

            {error && <Banner type="error">{error}</Banner>}

            <Card className="p-8">

                <form onSubmit={handleSubmit} className="space-y-8">

                    <FormSection
                        title="Informasi Kendaraan"
                        description="Masukkan data kendaraan."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <TextField
                                label="Plat Nomor"
                                value={formData.plateNumber}
                                onChange={(e) => set({ plateNumber: e.target.value })}
                                error={fieldErrors.plateNumber}
                                required
                            />

                            <TextField
                                label="Tipe Kendaraan"
                                placeholder="Contoh: BOX TRUCK"
                                value={formData.vehicleType}
                                onChange={(e) => set({ vehicleType: e.target.value })}
                                error={fieldErrors.vehicleType}
                                required
                            />

                            <TextField
                                label="Merek"
                                value={formData.brand}
                                onChange={(e) => set({ brand: e.target.value })}
                            />

                            <TextField
                                label="Kapasitas (kg)"
                                type="number"
                                min={0}
                                value={formData.capacityKg}
                                onChange={(e) => set({ capacityKg: e.target.value })}
                                error={fieldErrors.capacityKg}
                                required
                            />

                            <TextField
                                label="Tahun"
                                type="number"
                                min={1900}
                                max={2100}
                                value={formData.year}
                                onChange={(e) => set({ year: e.target.value })}
                                error={fieldErrors.year}
                            />

                            <Select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => set({ status: e.target.value as VehicleStatus })}
                                error={fieldErrors.status}
                                options={[
                                    { value: "TERSEDIA", label: "Tersedia" },
                                    { value: "PERAWATAN", label: "Perawatan" },
                                    { value: "NONAKTIF", label: "Nonaktif" },
                                    {
                                        value: "BERTUGAS",
                                        label: "Bertugas (otomatis dari pengiriman)",
                                        disabled: formData.status !== "BERTUGAS",
                                    },
                                ]}
                            />

                        </div>

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
