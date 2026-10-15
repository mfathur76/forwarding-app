import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    createCustomer,
    getCustomerById,
    updateCustomer,
} from "@/services/customerService";

export interface CustomerFormData {
    name: string;
    type: 'INDIVIDUAL' | 'COMPANY';
    company: string;
    email: string;
    phone: string;
    address: string;
}

const initialData: CustomerFormData = {
    name: "",
    type: "INDIVIDUAL",
    company: "",
    email: "",
    phone: "",
    address: "",
};

export function useCustomerForm(id?: string) {

    const navigate = useNavigate();

    const isEdit = !!id;

    const [formData, setFormData] =
        useState<CustomerFormData>(initialData);

    const [isLoading, setIsLoading] =
        useState(false);

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    useEffect(() => {

        if (!isEdit) return;

        loadCustomer();

    }, [id]);

    async function loadCustomer() {

        try {

            setIsLoading(true);

            setError("");

            const customer =
                await getCustomerById(id!);

            console.log('Loaded customer:', customer);

            const customerType = customer.type === 'COMPANY' ? 'COMPANY' : 'INDIVIDUAL';

            setFormData({

                name: customer.name,

                type: customerType,

                company: customer.company || "",

                email: customer.email,

                phone: customer.phone,

                address: customer.address,

            });

            console.log('Form data after load:', { 
                name: customer.name, 
                type: customerType, 
                company: customer.company || "" 
            });

        }
        catch {

            setError("Gagal mengambil data pelanggan.");

        }
        finally {

            setIsLoading(false);

        }

    }

    async function handleSubmit(
        e: React.FormEvent
    ) {

        e.preventDefault();

        try {

            setIsSubmitting(true);

            setError("");

            if (isEdit) {

                await updateCustomer(
                    id!,
                    formData
                );

            }
            else {

                await createCustomer(
                    formData
                );

            }

            navigate("/customers");

        }
        catch {

            setError("Gagal menyimpan data.");

        }
        finally {

            setIsSubmitting(false);

        }

    }

    function handleCancel() {

        navigate("/customers");

    }

    return {

        formData,

        setFormData,

        handleSubmit,

        handleCancel,

        isLoading,

        isSubmitting,

        error,

        isEdit,

    };

}