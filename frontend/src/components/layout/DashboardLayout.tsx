import { ReactNode } from "react";

import { Sidebar } from "./Sidebar";

interface Props {
    children: ReactNode;
}

export function DashboardLayout({
    children,
}: Props) {
    return (
        <div className="flex h-screen bg-zinc-100">

            <Sidebar />

            <main className="flex-1 overflow-y-auto">

                <div className="p-8">

                    {children}

                </div>

            </main>

        </div>
    );
}