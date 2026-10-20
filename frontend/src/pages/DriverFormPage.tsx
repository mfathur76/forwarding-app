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
    createDriver,
    getDriverById,
    updateDriver,
} from "@/services/driverService";

import type { DriverStatus } from "@/types/driver";

interface DriverForm {
    name: string;
    phone: string;
    licenseNumber: string;
    status: DriverStatus;
    address: string;
}

const initial: DriverForm = {
    name: "",
    phone: "",
    licenseNumber: "",
    status: "TERSEDIA",
    address: "",
};

export function DriverFormPage() {

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
    } = useEntityForm<DriverForm>({
        id,
        initial,
        backTo: "/drivers",
        label: "pengemudi",
        load: async (driverId) => {
            const driver = await getDriverById(driverId);

            return {
                name: driver.name,
                phone: driver.phone ?? "",
                licenseNumber: driver.licenseNumber,
                status: driver.status,
                address: driver.address ?? "",
            };
        },
        save: (data, driverId) =>
            driverId ? updateDriver(driverId, data) : createDriver(data),
    });

    if (isLoading) return <LoadingState />;

    const set = (patch: Partial<DriverForm>) =>
        setFormData({ ...formData, ...patch });

    return (

        <div className="space-y-6">

            <PageHeader
                title={isEdit ? "Edit Pengemudi" : "Tambah Pengemudi"}
                subtitle="Lengkapi informasi pengemudi."
            />

            {error && <Banner type="error">{error}</Banner>}

            <Card className="p-8">

                <form onSubmit={handleSubmit} className="space-y-8">

                    <FormSection
                        title="Informasi Pengemudi"
                        description="Masukkan data pengemudi."
                    >

                        <div className="grid gap-6 md:grid-cols-2">

                            <TextField
                                label="Nama"
                                value={formData.name}
                                onChange={(e) => set({ name: e.target.value })}
                                error={fieldErrors.name}
                                required
                            />

                            <TextField
                                label="Nomor SIM"
                                value={formData.licenseNumber}
                                onChange={(e) => set({ licenseNumber: e.target.value })}
                                error={fieldErrors.licenseNumber}
                                required
                            />

                            <TextField
                                label="No. Telepon"
                                value={formData.phone}
                                onChange={(e) => set({ phone: e.target.value })}
                                error={fieldErrors.phone}
                            />

                            <Select
                                label="Status"
                                value={formData.status}
                                onChange={(e) => set({ status: e.target.value as DriverStatus })}
                                error={fieldErrors.status}
                                options={[
                                    { value: "TERSEDIA", label: "Tersedia" },
                                    { value: "NONAKTIF", label: "Nonaktif" },
                                    {
                                        value: "BERTUGAS",
                                        label: "Bertugas (otomatis dari pengiriman)",
                                        disabled: formData.status !== "BERTUGAS",
                                    },
                                ]}
                            />

                        </div>

                        <TextArea
                            label="Alamat"
                            rows={3}
                            value={formData.address}
                            onChange={(e) => set({ address: e.target.value })}
                        />

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
