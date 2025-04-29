import React from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import CreateLinkModal from '@/Components/CreateLinkModal';
import LinksCard from '@/Components/LinksCard';
import EnhancedStats from '@/Components/EnhancedStats';
import { useTranslation } from 'react-i18next';

export default function Dashboard({ auth, links, deviceStats, countryStats }) {
    const { t } = useTranslation();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{t('common.dashboard')}</h2>}
        >
            <Head title={t('common.dashboard')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">{t('links.yourLinks')}</h1>
                        <CreateLinkModal />
                    </div>

                    <div className="space-y-6">
                        <LinksCard links={links} />
                        <EnhancedStats 
                            links={links} 
                            deviceStats={deviceStats} 
                            countryStats={countryStats} 
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
