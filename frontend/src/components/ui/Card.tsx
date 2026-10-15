import { ReactNode } from "react";

interface CardProps {
    children: ReactNode;
    className?: string;
}

export function Card({
    children,
    className = "",
}: CardProps) {
    return (
        <div
            className={`
                rounded-xl
                border
                border-zinc-200
                bg-white
                shadow-sm
                transition-all
                duration-300
                ${className}
            `}
        >
            {children}
        </div>
    );
}