import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { parseApiError } from "@/utils/errors";

interface Options<F> {
    id?: string;
    initial: F;
    load: (id: string) => Promise<F>;
    save: (data: F, id?: string) => Promise<unknown>;
    backTo: string;
    label: string;
}

// Hook form tambah/ubah generik.
export function useEntityForm<F>({
    id,
    initial,
    load,
    save,
    backTo,
    label,
}: Options<F>) {

    const navigate = useNavigate();

    const isEdit = !!id;

    const [formData, setFormData] = useState<F>(initial);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {

        if (!id) return;

        (async () => {
            try {
                setIsLoading(true);
                setFormData(await load(id));
            }
            catch (err) {
                setError(parseApiError(err, `Gagal mengambil data ${label}.`).message);
            }
            finally {
                setIsLoading(false);
            }
        })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function handleSubmit(e: FormEvent) {

        e.preventDefault();

        try {
            setIsSubmitting(true);
            setError("");
            setFieldErrors({});

            await save(formData, id);

            navigate(backTo);
        }
        catch (err) {
            const info = parseApiError(err, "Gagal menyimpan data.");

            setError(info.message);
            setFieldErrors(info.fieldErrors);
        }
        finally {
            setIsSubmitting(false);
        }
    }

    return {
        formData,
        setFormData,
        handleSubmit,
        handleCancel: () => navigate(backTo),
        isLoading,
        isSubmitting,
        error,
        fieldErrors,
        isEdit,
    };
}
