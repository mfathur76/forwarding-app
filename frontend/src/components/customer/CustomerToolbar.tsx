import { Search, Plus, RefreshCw } from "lucide-react";

interface Props {
    query: string;
    onQueryChange: (value: string) => void;
    onAdd: () => void;
    onRefresh: () => void;
}

export function CustomerToolbar({
    query,
    onQueryChange,
    onAdd,
    onRefresh,
}: Props) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

                <h1 className="text-3xl font-bold">
                    Pelanggan
                </h1>

                <p className="mt-1 text-zinc-500">
                    Kelola data pelanggan perusahaan.
                </p>

            </div>

            <div className="flex gap-3">

                <div className="relative">

                    <Search
                        size={18}
                        className="absolute left-3 top-3 text-zinc-400"
                    />

                    <input
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        className="form-input pl-10 w-64"
                        placeholder="Cari pelanggan..."
                    />

                </div>

                <button
                    className="btn-secondary"
                    onClick={onRefresh}
                >
                    <RefreshCw size={18}/>
                </button>

                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={onAdd}
                >
                    <Plus size={18}/>
                    Tambah
                </button>

            </div>

        </div>
    );
}