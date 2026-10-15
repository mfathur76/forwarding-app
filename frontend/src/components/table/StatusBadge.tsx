interface Props {

    status: string;

}

const colors = {

    Waiting: "bg-yellow-100 text-yellow-700",

    "On Route": "bg-blue-100 text-blue-700",

    Delivered: "bg-green-100 text-green-700",

    Cancelled: "bg-red-100 text-red-700",

};

export function StatusBadge({

    status

}: Props) {

    return (

        <span
            className={`
                rounded-full
                px-3
                py-1
                text-xs
                font-semibold
                ${colors[status as keyof typeof colors]}
            `}
        >

            {status}

        </span>

    );

}