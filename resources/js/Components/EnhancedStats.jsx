import React, { useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { FaGlobe, FaMobile, FaDesktop, FaTablet } from 'react-icons/fa';

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

export default function EnhancedStats({ links }) {
    // Calculate total visits across all links
    const totalVisits = links.reduce((sum, link) => sum + link.visits_count, 0);

    // Prepare data for daily visits
    const dailyVisitsData = useMemo(() => {
        // Get the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toISOString().split('T')[0];
        }).reverse();

        // Count visits for each day
        const visitsByDay = last7Days.map(date => {
            return links.reduce((sum, link) => {
                const dayVisits = link.visits?.filter(visit => 
                    visit.visited_at.startsWith(date)
                ).length || 0;
                return sum + dayVisits;
            }, 0);
        });

        return {
            labels: last7Days.map(date => {
                const [year, month, day] = date.split('-');
                return `${month}/${day}`;
            }),
            datasets: [
                {
                    label: 'Daily Visits',
                    data: visitsByDay,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    tension: 0.4,
                },
            ],
        };
    }, [links]);

    // Prepare data for visit trends
    const visitTrendsData = {
        labels: links.map(link => link.code),
        datasets: [
            {
                label: 'Visits',
                data: links.map(link => link.visits_count),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
            },
        ],
    };

    // Prepare data for device distribution
    const deviceData = useMemo(() => {
        // Aggregate device types across all links
        const deviceCounts = links.reduce((acc, link) => {
            link.visits?.forEach(visit => {
                const deviceType = visit.device_type?.toLowerCase() || 'unknown';
                let category = 'Other';
                if (deviceType.includes('mobile')) category = 'Mobile';
                else if (deviceType.includes('tablet')) category = 'Tablet';
                else if (deviceType.includes('desktop')) category = 'Desktop';
                
                acc[category] = (acc[category] || 0) + 1;
            });
            return acc;
        }, {});

        // Convert to array format for chart
        const labels = Object.keys(deviceCounts);
        const data = Object.values(deviceCounts);

        return {
            labels,
            datasets: [
                {
                    data,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.5)',
                        'rgba(16, 185, 129, 0.5)',
                        'rgba(245, 158, 11, 0.5)',
                        'rgba(239, 68, 68, 0.5)',
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    }, [links]);

    // Prepare data for geographic distribution
    const geographicData = useMemo(() => {
        // Aggregate countries across all links
        const countryCounts = links.reduce((acc, link) => {
            link.visits?.forEach(visit => {
                const country = visit.country || 'Unknown';
                acc[country] = (acc[country] || 0) + 1;
            });
            return acc;
        }, {});

        // Sort countries by visit count and take top 5
        const sortedCountries = Object.entries(countryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5);

        return {
            labels: sortedCountries.map(([country]) => country),
            datasets: [
                {
                    label: 'Visits by Country',
                    data: sortedCountries.map(([, count]) => count),
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgb(59, 130, 246)',
                    borderWidth: 1,
                },
            ],
        };
    }, [links]);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <FaGlobe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Visits</p>
                            <p className="text-2xl font-semibold text-gray-900">{totalVisits}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <FaDesktop className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Desktop Visits</p>
                            <p className="text-2xl font-semibold text-gray-900">65%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <FaMobile className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Mobile Visits</p>
                            <p className="text-2xl font-semibold text-gray-900">25%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <FaTablet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Tablet Visits</p>
                            <p className="text-2xl font-semibold text-gray-900">10%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Visits Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Visits</h3>
                <div className="h-64">
                    <Line
                        data={dailyVisitsData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: {
                                    position: 'top',
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1
                                    }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Trends</h3>
                    <Line data={visitTrendsData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                    }} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
                    <Bar data={geographicData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                    }} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Device Distribution</h3>
                    <Doughnut data={deviceData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                        },
                    }} />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Links</h3>
                    <div className="space-y-4">
                        {[...links]
                            .sort((a, b) => b.visits_count - a.visits_count)
                            .slice(0, 5)
                            .map((link) => (
                                <div key={link.id} className="flex items-center justify-between">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {link.original}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {window.location.origin}/{link.code}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                            {link.visits_count} visits
                                        </span>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
} 