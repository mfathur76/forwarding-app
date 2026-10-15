interface Props {
    loading?: boolean;
    submitLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
}

export function FormActions({
    loading,
    submitLabel = "Simpan",
    cancelLabel = "Batal",
    onCancel,
}: Props) {
    return (
        <div className="flex justify-end gap-3 border-t pt-6">

            <button
                type="button"
                onClick={onCancel}
                className="btn-secondary"
            >
                {cancelLabel}
            </button>

            <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
            >
                {loading ? "Menyimpan..." : submitLabel}
            </button>

        </div>
    );
}