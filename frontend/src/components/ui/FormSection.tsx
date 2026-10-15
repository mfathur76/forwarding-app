import { ReactNode } from "react";

interface Props {
    title: string;
    description?: string;
    children: ReactNode;
}

export function FormSection({
    title,
    description,
    children,
}: Props) {
    return (
        <div className="space-y-6">

            <div>

                <h2 className="text-lg font-semibold">
                    {title}
                </h2>

                {description && (
                    <p className="mt-1 text-sm text-zinc-500">
                        {description}
                    </p>
                )}

            </div>

            {children}

        </div>
    );
}