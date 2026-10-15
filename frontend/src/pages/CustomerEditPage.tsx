import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";

import { CustomerForm } from "@/components/customer/CustomerForm";

import { useCustomerForm } from "@/hooks/useCustomerForm";
import { useParams } from "react-router-dom";
import { LoadingState } from "@/components/ui/LoadingState";

export function CustomerEditPage() {

    const { id } = useParams<{ id: string }>();

    const {

        formData,

        setFormData,

        handleSubmit,

        handleCancel,

        isSubmitting,

        error,

        isLoading,

    } = useCustomerForm(id);

    if (isLoading) {
        return <LoadingState />;
    }

    return (

        <div className="space-y-6">

            <PageHeader
                title="Edit Pelanggan"
                subtitle="Perbarui informasi pelanggan."
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

                    isEdit={true}

                />

            </Card>

        </div>

    );

}
