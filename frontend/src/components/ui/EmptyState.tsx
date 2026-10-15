import { Inbox } from "lucide-react";

interface Props {

    message: string;

}

export function EmptyState({

    message

}: Props) {

    return (

        <div className="flex flex-col items-center justify-center py-20">

            <Inbox

                size={40}

                className="text-zinc-400"

            />

            <p className="mt-4 text-zinc-500">

                {message}

            </p>

        </div>

    )

}