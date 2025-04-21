import React from 'react';
import { FaLink, FaEye, FaChartLine, FaGlobe } from 'react-icons/fa';

export default function DashboardStats({ stats }) {
    const statItems = [
        {
            title: 'Total Links',
            value: stats?.totalLinks || 0,
            icon: FaLink,
            color: 'bg-blue-500'
        },
        {
            title: 'Total Visits',
            value: stats?.totalVisits || 0,
            icon: FaEye,
            color: 'bg-green-500'
        },
        {
            title: 'Active Links',
            value: stats?.activeLinks || 0,
            icon: FaChartLine,
            color: 'bg-purple-500'
        },
        {
            title: 'Countries',
            value: stats?.uniqueCountries || 0,
            icon: FaGlobe,
            color: 'bg-yellow-500'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statItems.map((item, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className={`${item.color} p-3 rounded-full`}>
                            <item.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">{item.title}</p>
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
} 