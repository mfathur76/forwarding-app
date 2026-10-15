import { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export interface Column<T> {

    key: keyof T | string;

    title: string;

    width?: string;

    align?: "left" | "center" | "right";

    render?: (row: T) => ReactNode;

}

interface Props<T> {

    columns: Column<T>[];

    rows: T[];

    rowKey: keyof T;

    emptyMessage?: string;

}

export function DataTable<T extends Record<string, any>>({

    columns,

    rows,

    rowKey,

    emptyMessage = "Tidak ada data."

}: Props<T>) {

    return (

        <Card>

            <div className="overflow-x-auto">

                <table className="min-w-full">

                    <thead className="bg-zinc-50">

                        <tr>

                            {columns.map(col => (

                                <th
                                    key={String(col.key)}
                                    style={{
                                        width: col.width
                                    }}
                                    className={`
                                        px-5
                                        py-4
                                        text-sm
                                        font-semibold
                                        text-zinc-600
                                        ${col.align === "center" ? "text-center" : ""}
                                        ${col.align === "right" ? "text-right" : "text-left"}
                                    `}
                                >

                                    {col.title}

                                </th>

                            ))}

                        </tr>

                    </thead>

                    <tbody>

                        {rows.length === 0 && (

                            <tr>

                                <td
                                    colSpan={columns.length}
                                    className="py-16 text-center text-zinc-400"
                                >

                                    {emptyMessage}

                                </td>

                            </tr>

                        )}

                        {rows.map(row => (

                            <tr
                                key={String(row[rowKey])}
                                className="
                                    border-t
                                    hover:bg-orange-50
                                    transition
                                "
                            >

                                {columns.map(col => (

                                    <td
                                        key={String(col.key)}
                                        className={`
                                            px-5
                                            py-4
                                            ${col.align === "center" ? "text-center" : ""}
                                            ${col.align === "right" ? "text-right" : ""}
                                        `}
                                    >

                                        {col.render
                                            ? col.render(row)
                                            : String(row[col.key as keyof T] ?? "")}

                                    </td>

                                ))}

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </Card>

    );

}