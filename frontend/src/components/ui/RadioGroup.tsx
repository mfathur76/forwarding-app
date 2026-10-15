import clsx from "clsx";

export interface RadioOption {

    label: string;

    value: string;

    disabled?: boolean;

}

interface RadioGroupProps {

    label?: string;

    value: string;

    options: RadioOption[];

    required?: boolean;

    disabled?: boolean;

    error?: string;

    direction?: "row" | "column";

    onChange: (value: string) => void;

}

export function RadioGroup({

    label,

    value,

    options,

    required = false,

    disabled = false,

    error,

    direction = "row",

    onChange,

}: RadioGroupProps) {

    return (

        <div className="space-y-2">

            {label && (

                <label className="block text-sm font-medium text-zinc-700">

                    {label}

                    {required && (

                        <span className="ml-1 text-red-500">*</span>

                    )}

                </label>

            )}

            <div
                className={clsx(
                    "flex gap-6",
                    direction === "column" && "flex-col gap-3"
                )}
            >

                {options.map(option => (

                    <label
                        key={option.value}
                        className={clsx(
                            "flex cursor-pointer items-center gap-2",
                            (disabled || option.disabled) &&
                                "cursor-not-allowed opacity-50"
                        )}
                    >

                        <input
                            type="radio"
                            checked={value === option.value}
                            disabled={disabled || option.disabled}
                            onChange={() => onChange(option.value)}
                            className="
                                h-4
                                w-4
                                border-zinc-300
                                text-orange-600
                                focus:ring-orange-500
                            "
                        />

                        <span className="text-sm text-zinc-700">

                            {option.label}

                        </span>

                    </label>

                ))}

            </div>

            {error && (

                <p className="text-sm text-red-500">

                    {error}

                </p>

            )}

        </div>

    );

}