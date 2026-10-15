import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Props {

    label: string;

    value: number;

    subtitle?: string;

    icon: LucideIcon;

}

export function StatCard({

    label,

    value,

    subtitle,

    icon: Icon

}: Props) {

    return (

        <Card
            className="
p-6
hover:-translate-y-1
hover:border-orange-300
hover:shadow-lg
cursor-pointer
"
        >

            <div className="flex justify-between">

                <div>

                    <p className="text-xs uppercase tracking-[4px] text-zinc-500">

                        {label}

                    </p>

                    <h2 className="mt-3 text-4xl font-bold">

                        {value}

                    </h2>

                    {subtitle && (

                        <p className="mt-2 text-sm text-zinc-500">

                            {subtitle}

                        </p>

                    )}

                </div>

                <div
                    className="
flex
h-12
w-12
items-center
justify-center
rounded-xl
bg-orange-100
"
                >

                    <Icon

                        size={22}

                        className="text-orange-500"

                    />

                </div>

            </div>

        </Card>

    )

}