import type {
    ShipmentStatus,
} from "@/types/dashboard";
import { Card } from "../ui/Card";
import { SectionHeader } from "../ui/SectionHeader";

interface Props {

    status: ShipmentStatus[];

}

export function ShipmentStatusCard({

    status

}: Props) {

    return (

        <Card className="p-6">

            <SectionHeader
                title="Status Pengiriman"
            />

            <div className="space-y-4">

                {status.map((item) => (

                    <div
                        key={item.label}
                        className="flex items-center justify-between"
                    >

                        <span>

                            {item.label}

                        </span>

                        <span className="font-semibold">

                            {item.value}

                        </span>

                    </div>

                ))}

            </div>

        </Card>

    )

}