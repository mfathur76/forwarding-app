import { NavLink } from "react-router-dom";

import { LucideIcon } from "lucide-react";

interface Props {
    title: string;
    icon: LucideIcon;
    to: string;
}

export function SidebarItem({
    title,
    icon: Icon,
    to,
}: Props) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    isActive
                        ? "bg-orange-500 text-white shadow"
                        : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`
            }
        >
            <Icon size={18} />

            <span>{title}</span>
        </NavLink>
    );
}