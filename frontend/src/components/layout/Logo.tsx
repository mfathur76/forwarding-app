import { Package2 } from "lucide-react";

export function Logo() {
    return (
        <div className="border-b border-zinc-800 p-6">

            <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500">

                    <Package2
                        className="text-white"
                        size={20}
                    />

                </div>

                <div>

                    <h2 className="font-bold text-white">
                        RIZKI ABHIRAKA
                    </h2>

                    <p className="mt-1 text-[11px] uppercase tracking-[4px] text-zinc-400">
                        PT • TRANS FREIGHT
                    </p>

                </div>

            </div>

        </div>
    );
}