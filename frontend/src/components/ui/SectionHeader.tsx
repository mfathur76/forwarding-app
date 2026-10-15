interface Props {

    title: string;

    action?: React.ReactNode;

}

export function SectionHeader({

    title,

    action

}: Props) {

    return (

        <div className="flex items-center justify-between mb-5">

            <h2 className="text-lg font-semibold">

                {title}

            </h2>

            {action}

        </div>

    )

}