import { Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Customer {

    id: string;

    name: string;

    type: 'INDIVIDUAL' | 'COMPANY';

    company?: string;

    email: string;

    phone: string;

    address: string;

}

interface Props {

    customers: Customer[];

    onEdit: (customer: Customer) => void;

    onDelete: (id: string) => void;

}

export function CustomerTable({

    customers,

    onEdit,

    onDelete

}: Props) {

    return (

        <Card>

            <div className="overflow-x-auto">

                <table className="w-full">

                    <thead className="bg-zinc-50">

                        <tr>

                            <th className="px-6 py-4 text-left">

                                Nama

                            </th>

                            <th>Tipe</th>

                            <th>Email</th>

                            <th>Telepon</th>

                            <th>Alamat</th>

                            <th className="w-32">

                                Aksi

                            </th>

                        </tr>

                    </thead>

                    <tbody>

                        {customers.map(customer => (

                            <tr
                                key={customer.id}
                                className="border-t hover:bg-orange-50"
                            >

                                <td className="px-6 py-4 font-medium">

                                    {customer.name}

                                </td>

                                <td>

                                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                        customer.type === 'COMPANY' 
                                            ? 'bg-blue-100 text-blue-800' 
                                            : 'bg-green-100 text-green-800'
                                    }`}>
                                        {customer.type === 'COMPANY' ? 'Perusahaan' : 'Individu'}
                                    </span>
                                </td>

                                <td>

                                    {customer.email}

                                </td>

                                <td>

                                    {customer.phone}

                                </td>

                                <td className="max-w-xs truncate">

                                    {customer.address}

                                </td>

                                <td>

                                    <div className="flex gap-2">

                                        <button
                                            className="btn-secondary"
                                            onClick={() => onEdit(customer)}
                                        >

                                            <Pencil size={16} />

                                        </button>

                                        <button
                                            className="btn-danger"
                                            onClick={() => onDelete(customer.id)}
                                        >

                                            <Trash2 size={16} />

                                        </button>

                                    </div>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </Card>

    )

}