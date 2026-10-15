import { TriangleAlert } from "lucide-react";

interface Props {

    message: string;

    onRetry?: () => void;

}

export function ErrorState({

    message,

    onRetry

}: Props) {

    return (

        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">

            <TriangleAlert
                className="mx-auto text-red-500"
                size={40}
            />

            <p className="mt-4 text-red-700">

                {message}

            </p>

            {onRetry && (

                <button
                    onClick={onRetry}
                    className="btn-primary mt-6"
                >

                    Coba Lagi

                </button>

            )}

        </div>

    )

}