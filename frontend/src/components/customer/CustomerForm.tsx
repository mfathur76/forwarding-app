import { FormEvent } from "react";

import { TextField } from "@/components/ui/TextField";
import { TextArea } from "@/components/ui/TextArea";
import { FormActions } from "@/components/ui/FormActions";
import { FormSection } from "@/components/ui/FormSection";

interface CustomerFormData {
    name: string;
    type: 'INDIVIDUAL' | 'COMPANY';
    company: string;
    email: string;
    phone: string;
    address: string;
}

interface Props {
    formData: CustomerFormData;
    onChange: (data: CustomerFormData) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
    loading?: boolean;
    isEdit?: boolean;
}

export function CustomerForm({
    formData,
    onChange,
    onSubmit,
    onCancel,
    loading,
    isEdit,
}: Props) {
    return (
        <form
            onSubmit={onSubmit}
            className="space-y-8"
        >

            <FormSection
                title="Informasi Pelanggan"
                description="Masukkan data pelanggan."
            >

                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Tipe Pelanggan
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="INDIVIDUAL"
                                    checked={formData.type === 'INDIVIDUAL'}
                                    onChange={(e) =>
                                        onChange({
                                            ...formData,
                                            type: e.target.value as 'INDIVIDUAL' | 'COMPANY',
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="ml-2 text-sm text-gray-700">Individu</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="type"
                                    value="COMPANY"
                                    checked={formData.type === 'COMPANY'}
                                    onChange={(e) =>
                                        onChange({
                                            ...formData,
                                            type: e.target.value as 'INDIVIDUAL' | 'COMPANY',
                                        })
                                    }
                                    className="w-4 h-4"
                                />
                                <span className="ml-2 text-sm text-gray-700">Perusahaan</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">

                    <TextField
                        label="Nama"
                        value={formData.name}
                        onChange={(e) =>
                            onChange({
                                ...formData,
                                name: e.target.value,
                            })
                        }
                        required
                    />

                    {formData.type === 'COMPANY' && (
                        <TextField
                            label="Nama Perusahaan"
                            value={formData.company}
                            onChange={(e) =>
                                onChange({
                                    ...formData,
                                    company: e.target.value,
                                })
                            }
                            required={formData.type === 'COMPANY'}
                        />
                    )}

                    <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            onChange({
                                ...formData,
                                email: e.target.value,
                            })
                        }
                        required
                    />

                    <TextField
                        label="No. Telepon"
                        value={formData.phone}
                        onChange={(e) =>
                            onChange({
                                ...formData,
                                phone: e.target.value,
                            })
                        }
                        required
                    />

                </div>

                <TextArea
                    label="Alamat"
                    rows={4}
                    value={formData.address}
                    onChange={(e) =>
                        onChange({
                            ...formData,
                            address: e.target.value,
                        })
                    }
                    required
                />

            </FormSection>

            <FormActions
                loading={loading}
                submitLabel={isEdit ? "Update" : "Simpan"}
                onCancel={onCancel}
            />

        </form>
    );
}