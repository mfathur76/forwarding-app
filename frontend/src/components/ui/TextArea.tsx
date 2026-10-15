import { TextareaHTMLAttributes } from "react";

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export function TextArea({
    label,
    error,
    className = "",
    ...props
}: Props) {
    return (
        <div className="space-y-2">

            <label className="block text-sm font-medium text-zinc-700">
                {label}
            </label>

            <textarea
                {...props}
                className={`
                    w-full
                    rounded-lg
                    border
                    border-zinc-300
                    px-4
                    py-3
                    outline-none
                    transition
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-200
                    ${className}
                `}
            />

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}

        </div>
    );
}