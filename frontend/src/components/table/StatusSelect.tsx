import { statusLabel } from "./StatusBadge";

interface Props<S extends string> {
    value: S;
    options: S[];
    disabled?: boolean;
    onChange: (status: S) => void;
}

// Pilihan status langsung di dalam baris tabel.
export function StatusSelect<S extends string>({
    value,
    options,
    disabled,
    onChange,
}: Props<S>) {
    return (
        <select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value as S)}
            className="
                rounded-lg
                border
                border-zinc-300
                bg-white
                px-2
                py-1.5
                text-sm
                outline-none
                focus:border-orange-500
                disabled:bg-zinc-100
                disabled:text-zinc-500
            "
        >
            {options.map((option) => (
                <option key={option} value={option}>
                    {statusLabel(option)}
                </option>
            ))}
        </select>
    );
}
