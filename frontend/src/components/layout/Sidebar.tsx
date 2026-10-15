import {
    LayoutDashboard,
    Users,
    Truck,
    Package,
    Receipt,
    UserRound,
    LogOut,
} from "lucide-react";

import { Logo } from "./Logo";

import { SidebarItem } from "./SidebarItem";

const menus = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        to: "/dashboard",
    },
    {
        title: "Pelanggan",
        icon: Users,
        to: "/customers",
    },
    {
        title: "Pengemudi",
        icon: UserRound,
        to: "/drivers",
    },
    {
        title: "Kendaraan",
        icon: Truck,
        to: "/vehicles",
    },
    {
        title: "Pengiriman",
        icon: Package,
        to: "/shipments",
    },
    {
        title: "Faktur",
        icon: Receipt,
        to: "/invoices",
    },
];

export function Sidebar() {
    return (
        <aside className="flex h-screen w-64 flex-col bg-zinc-950 shadow-xl">

            <Logo />

            <div className="flex-1 px-4 py-6">

                <p className="mb-4 px-2 text-[10px] uppercase tracking-[4px] text-zinc-500">
                    Operasional
                </p>

                <div className="space-y-1">

                    {menus.map((menu) => (
                        <SidebarItem
                            key={menu.to}
                            {...menu}
                        />
                    ))}

                </div>

            </div>

            <div className="border-t border-zinc-800 p-6">

                <p className="text-[10px] uppercase tracking-[4px] text-zinc-500">
                    Masuk Sebagai
                </p>

                <p className="mt-2 text-sm text-white">
                    admin@rizkitrans.co.id
                </p>

                <button
                    className="
                    mt-6
                    flex
                    items-center
                    gap-2
                    text-zinc-400
                    transition
                    hover:text-white
                "
                >
                    <LogOut size={18} />

                    Keluar

                </button>

            </div>

        </aside>
    );
}