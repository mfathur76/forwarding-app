import { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
}

export function TextField({
    label,
    error,
    className = "",
    ...props
}: TextFieldProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">
                {label}
            </label>

            <input
                {...props}
                className={`
                    w-full
                    rounded-lg
                    border
                    border-zinc-300
                    bg-white
                    px-4
                    py-2.5
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