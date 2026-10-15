import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface Props {
    paid: number;
    outstanding: number;
}

export function RevenueCard({
    paid,
    outstanding
}: Props) {

    return (

        <div className="space-y-5">

            <Card className="p-6">

                <SectionHeader
                    title="Pendapatan"
                />

                <p className="mt-3 text-3xl font-bold text-green-600">

                    Rp {paid.toLocaleString("id-ID")}

                </p>

            </Card>

            <Card className="p-6">

                <SectionHeader
                    title="Piutang"
                />

                <p className="mt-3 text-3xl font-bold text-orange-600">

                    Rp {outstanding.toLocaleString("id-ID")}

                </p>

            </Card>

        </div>

    )

}