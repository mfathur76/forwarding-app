import {
    Eye,
    Pencil,
    Trash2,
} from "lucide-react";

interface Props {

    onView?: () => void;

    onEdit?: () => void;

    onDelete?: () => void;

}

export function TableActions({

    onView,

    onEdit,

    onDelete,

}: Props) {

    return (

        <div className="flex items-center justify-center gap-2">

            {onView && (

                <button
                    onClick={onView}
                    className="
                        rounded-lg
                        border
                        border-zinc-200
                        p-2
                        transition
                        hover:bg-blue-50
                    "
                >
                    <Eye
                        size={16}
                        className="text-blue-600"
                    />
                </button>

            )}

            {onEdit && (

                <button
                    onClick={onEdit}
                    className="
                        rounded-lg
                        border
                        border-zinc-200
                        p-2
                        transition
                        hover:bg-orange-50
                    "
                >
                    <Pencil
                        size={16}
                        className="text-orange-600"
                    />
                </button>

            )}

            {onDelete && (

                <button
                    onClick={onDelete}
                    className="
                        rounded-lg
                        border
                        border-zinc-200
                        p-2
                        transition
                        hover:bg-red-50
                    "
                >
                    <Trash2
                        size={16}
                        className="text-red-600"
                    />
                </button>

            )}

        </div>

    );

}