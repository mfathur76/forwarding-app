import { SelectHTMLAttributes } from "react";

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
}

export function Select({
    label,
    options,
    placeholder,
    error,
    className = "",
    ...props
}: SelectProps) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-zinc-700">
                {label}
            </label>

            <select
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
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}

                {options.map((option) => (
                    <option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                    >
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
