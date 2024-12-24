import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import LinkStats from "@/Components/LinksStats";

export default function Stats({
    visits_by_date,
    visits_by_country,
    visits_by_city,
    visits_by_language,
}) {
    const stats = {
        visits_by_date,
        visits_by_country,
        visits_by_city,
        visits_by_language,
    };
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Stats
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="container mx-auto">
                <LinkStats stats={stats} />
            </div>
        </AuthenticatedLayout>
    );
}
