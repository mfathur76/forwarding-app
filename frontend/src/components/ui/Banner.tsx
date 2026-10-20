interface Props {
    type: "success" | "error";
    children: string;
}

export function Banner({ type, children }: Props) {

    const color = type === "success"
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-red-200 bg-red-50 text-red-700";

    return (
        <div className={`rounded-lg border p-4 ${color}`}>
            {children}
        </div>
    );
}
