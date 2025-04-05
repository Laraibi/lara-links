import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaArrowLeft, FaChartLine, FaGlobe, FaMobile, FaCalendarAlt, FaExternalLinkAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

export default function Stats({ link, visits, countryStats, deviceStats, dailyStats }) {
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    const handleCopy = () => {
        const shortUrl = `${window.location.origin}/${link.code}`;
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    // Prepare data for charts
    const dailyData = {
        labels: dailyStats.map(stat => new Date(stat.date).toLocaleDateString()),
        datasets: [
            {
                label: 'Visits',
                data: dailyStats.map(stat => stat.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const countryData = {
        labels: countryStats.map(stat => stat.country || 'Unknown'),
        datasets: [
            {
                data: countryStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
            },
        ],
    };

    const deviceData = {
        labels: deviceStats.map(stat => {
            const device = stat.device.toLowerCase();
            if (device.includes('mobile')) return 'Mobile';
            if (device.includes('tablet')) return 'Tablet';
            if (device.includes('windows') || device.includes('mac') || device.includes('linux')) return 'Desktop';
            return 'Other';
        }),
        datasets: [
            {
                data: deviceStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    precision: 0,
                },
            },
        },
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Stats for ${link.name || 'Link'}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Header with back button and link info */}
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => window.history.back()}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        <FaArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {link.name || 'Unnamed Link'}
                                        </h1>
                                        <p className="text-sm text-gray-500 truncate max-w-md">
                                            {link.original}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-gray-700 font-mono text-sm truncate mr-2">
                                            {window.location.origin}/{link.code}
                                        </span>
                                        <button
                                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={handleCopy}
                                        >
                                            {copied ? (
                                                <>
                                                    <FaCheck className="mr-1 h-3 w-3" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <FaCopy className="mr-1 h-3 w-3" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <a
                                        href={link.original}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <FaExternalLinkAlt className="mr-2 h-4 w-4" />
                                        Visit
                                    </a>
                                </div>
                            </div>

                            {/* Stats Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Total Visits</p>
                                            <p className="text-3xl font-bold text-gray-900">{visits.length}</p>
                                        </div>
                                        <div className="bg-indigo-100 p-3 rounded-full">
                                            <FaChartLine className="h-6 w-6 text-indigo-600" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Countries</p>
                                            <p className="text-3xl font-bold text-gray-900">{countryStats.length}</p>
                                        </div>
                                        <div className="bg-emerald-100 p-3 rounded-full">
                                            <FaGlobe className="h-6 w-6 text-emerald-600" />
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Device Types</p>
                                            <p className="text-3xl font-bold text-gray-900">{deviceStats.length}</p>
                                        </div>
                                        <div className="bg-amber-100 p-3 rounded-full">
                                            <FaMobile className="h-6 w-6 text-amber-600" />
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Tabs for different views */}
                            <div className="mb-6">
                                <div className="border-b border-gray-200">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab('overview')}
                                            className={`${
                                                activeTab === 'overview'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('daily')}
                                            className={`${
                                                activeTab === 'daily'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Daily Visits
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('countries')}
                                            className={`${
                                                activeTab === 'countries'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Countries
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('devices')}
                                            className={`${
                                                activeTab === 'devices'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Devices
                                        </button>
                                    </nav>
                                </div>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-6">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                    >
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Visits</h3>
                                            <div className="h-64">
                                                <Line data={dailyData} options={chartOptions} />
                                            </div>
                                        </div>
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Countries</h3>
                                            <div className="h-64">
                                                <Doughnut data={countryData} options={chartOptions} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'daily' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Visit Trends</h3>
                                        <div className="h-80">
                                            <Line data={dailyData} options={chartOptions} />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'countries' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Visits by Country</h3>
                                        <div className="h-80">
                                            <Doughnut data={countryData} options={chartOptions} />
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'devices' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Visits by Device Type</h3>
                                        <div className="h-80">
                                            <Doughnut data={deviceData} options={chartOptions} />
                                        </div>
                                    </motion.div>
                                )}
                            </div>

                            {/* Recent Visits Table */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Visits</h3>
                                <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Date
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Country
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Device
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    IP Address
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {visits.slice(0, 10).map((visit, index) => (
                                                <tr key={index}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(visit.visited_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {visit.country || 'Unknown'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {visit.device}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {visit.ip}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
