interface Props {

    open: boolean;

    title: string;

    message: string;

    onCancel: () => void;

    onConfirm: () => void;

}

export function ConfirmDialog({

    open,

    title,

    message,

    onCancel,

    onConfirm,

}: Props) {

    if (!open) {

        return null;

    }

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">

            <div className="w-[420px] rounded-xl bg-white p-6 shadow-xl">

                <h2 className="text-xl font-semibold">

                    {title}

                </h2>

                <p className="mt-3 text-zinc-500">

                    {message}

                </p>

                <div className="mt-8 flex justify-end gap-3">

                    <button
                        onClick={onCancel}
                        className="btn-secondary"
                    >
                        Batal
                    </button>

                    <button
                        onClick={onConfirm}
                        className="btn-danger"
                    >
                        Hapus
                    </button>

                </div>

            </div>

        </div>

    );

}