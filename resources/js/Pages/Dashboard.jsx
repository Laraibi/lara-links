import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CreateLinkModal from '@/Components/CreateLinkModal';
import LinksCard from '@/Components/LinksCard';
import EnhancedStats from '@/Components/EnhancedStats';

export default function Dashboard({ auth, links }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">Your Links</h1>
                        <CreateLinkModal />
                    </div>

                    <div className="space-y-6">
                        <LinksCard links={links} />
                        <EnhancedStats links={links} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
