import { CalendarDays } from "lucide-react";

interface Props {

    title: string;

    subtitle?: string;

}

export function PageHeader({

    title,

    subtitle

}: Props) {

    const today = new Date().toLocaleDateString("id-ID", {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    });

    return (

        <div className="flex items-center justify-between">

            <div>

                <h1 className="text-4xl font-bold">

                    {title}

                </h1>

                {subtitle && (

                    <p className="mt-2 text-zinc-500">

                        {subtitle}

                    </p>

                )}

            </div>

            <div className="flex items-center gap-2 rounded-lg border bg-white px-4 py-3">

                <CalendarDays
                    size={18}
                    className="text-orange-500"
                />

                <span className="text-sm">

                    {today}

                </span>

            </div>

        </div>

    )

}