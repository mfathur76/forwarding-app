import { CalendarDays } from "lucide-react";

export function DashboardHeader() {

    const today = new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });

    return (

        <div className="flex items-center justify-between">

            <div>

                <p className="uppercase tracking-[4px] text-xs font-semibold text-orange-500">

                    PT RIZKI ABHIRAKA TRANS

                </p>

                <h1 className="mt-2 text-4xl font-bold">

                    Dashboard Operasional

                </h1>

                <p className="mt-2 text-zinc-500">

                    Ringkasan aktivitas forwarding hari ini.

                </p>

            </div>

            <div className="flex items-center gap-3 rounded-xl border bg-white px-5 py-3 shadow-sm">

                <CalendarDays
                    className="text-orange-500"
                    size={20}
                />

                <span className="text-sm">

                    {today}

                </span>

            </div>

        </div>

    );

}