import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

import { CustomerForm } from "@/components/customer/CustomerForm";

import { useCustomerForm } from "@/hooks/useCustomerForm";

export function CustomerCreatePage() {

    const {

        formData,

        setFormData,

        handleSubmit,

        handleCancel,

        isSubmitting,

        error,

    } = useCustomerForm();

    return (

        <div className="space-y-6">

            <PageHeader
                title="Tambah Pelanggan"
                subtitle="Lengkapi informasi pelanggan."
            />

            {error && (

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">

                    {error}

                </div>

            )}

            <Card className="p-8">

                <CustomerForm

                    formData={formData}

                    onChange={setFormData}

                    onSubmit={handleSubmit}

                    onCancel={handleCancel}

                    loading={isSubmitting}

                />

            </Card>

        </div>

    );

}
