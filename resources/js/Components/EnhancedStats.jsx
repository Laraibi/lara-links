import React, { useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import PropTypes from 'prop-types';
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
    Filler
} from 'chart.js';
import { FaGlobe, FaMobile, FaDesktop, FaTablet } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

// Move PropTypes outside of the component
const propTypes = {
    links: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        code: PropTypes.string,
        original: PropTypes.string,
        visits_count: PropTypes.number,
        visits: PropTypes.array
    })),
    deviceStats: PropTypes.arrayOf(PropTypes.shape({
        device_type: PropTypes.string,
        count: PropTypes.number
    })),
    countryStats: PropTypes.arrayOf(PropTypes.shape({
        country: PropTypes.string,
        count: PropTypes.number
    }))
};

// Use default parameters in the function declaration instead of defaultProps
export default function EnhancedStats({ 
    links = [], 
    deviceStats = [], 
    countryStats = [] 
}) {
    const { t } = useTranslation();
    
    // Calculate total visits across all links
    const totalVisits = links.reduce((sum, link) => sum + (link.visits_count || 0), 0);

    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },
            }
        },
    };

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
                    visit.visited_at?.startsWith(date)
                )?.length || 0;
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
                    label: t('stats.dailyVisits'),
                    data: visitsByDay,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                },
            ],
        };
    }, [links, t]);

    // Prepare data for visit trends
    const visitTrendsData = useMemo(() => ({
        labels: links.map(link => link.code || ''),
        datasets: [
            {
                label: t('stats.visits'),
                data: links.map(link => link.visits_count || 0),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
            },
        ],
    }), [links, t]);

    // Prepare data for device distribution using deviceStats from backend
    const deviceData = useMemo(() => {
        if (!deviceStats || deviceStats.length === 0) {
            return {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            };
        }

        return {
            labels: deviceStats.map(stat => {
                const type = stat?.device_type?.toLowerCase() || 'unknown';
                if (type.includes('desktop')) return t('stats.desktopVisits');
                if (type.includes('mobile')) return t('stats.mobileVisits');
                if (type.includes('tablet')) return t('stats.tabletVisits');
                return t('common.other');
            }),
            datasets: [{
                data: deviceStats.map(stat => stat?.count || 0),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',  // Indigo for desktop
                    'rgba(16, 185, 129, 0.8)',  // Green for mobile
                    'rgba(245, 158, 11, 0.8)',  // Yellow for tablet
                    'rgba(156, 163, 175, 0.8)', // Gray for other
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
    }, [deviceStats, t]);

    // Prepare data for geographic distribution using countryStats from backend
    const geographicData = useMemo(() => {
        if (!countryStats || countryStats.length === 0) {
            return {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            };
        }

        // Take top 5 countries
        const topCountries = countryStats.slice(0, 5);

        return {
            labels: topCountries.map(stat => stat?.country || t('common.unknown')),
            datasets: [{
                data: topCountries.map(stat => stat?.count || 0),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(245, 158, 11, 0.8)',   // Yellow
                    'rgba(239, 68, 68, 0.8)',    // Red
                    'rgba(139, 92, 246, 0.8)',   // Purple
                ],
                borderColor: '#FFFFFF',
                borderWidth: 2,
                hoverOffset: 4
            }]
        };
    }, [countryStats, t]);

    // Chart options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        const value = context.raw;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };

    // Update the Stats Overview section to use actual device stats
    const devicePercentages = useMemo(() => {
        if (!deviceStats || deviceStats.length === 0) {
            return { desktop: 0, mobile: 0, tablet: 0 };
        }

        const total = deviceStats.reduce((sum, stat) => sum + (stat?.count || 0), 0);
        const getPercentage = (type) => {
            const stat = deviceStats.find(s => s?.device_type?.toLowerCase()?.includes(type));
            return total > 0 ? Math.round((stat?.count || 0) / total * 100) : 0;
        };

        return {
            desktop: getPercentage('desktop'),
            mobile: getPercentage('mobile'),
            tablet: getPercentage('tablet')
        };
    }, [deviceStats]);

    return (
        <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100">
                            <FaGlobe className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('stats.totalVisits')}</p>
                            <p className="text-lg font-semibold text-gray-900">{totalVisits}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-green-100">
                            <FaDesktop className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('stats.desktopVisits')}</p>
                            <p className="text-lg font-semibold text-gray-900">{devicePercentages.desktop}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-yellow-100">
                            <FaMobile className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('stats.mobileVisits')}</p>
                            <p className="text-lg font-semibold text-gray-900">{devicePercentages.mobile}%</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-purple-100">
                            <FaTablet className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">{t('stats.tabletVisits')}</p>
                            <p className="text-lg font-semibold text-gray-900">{devicePercentages.tablet}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.dailyVisits')}</h3>
                    <div className="h-[300px]">
                        <Line data={dailyVisitsData} options={commonOptions} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.visitTrends')}</h3>
                    <div className="h-[300px]">
                        <Line data={visitTrendsData} options={commonOptions} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.geographicDistribution')}</h3>
                    <div className="h-80">
                        {countryStats && countryStats.length > 0 ? (
                            <Doughnut data={geographicData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                {t('common.noResults')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.deviceDistribution')}</h3>
                    <div className="h-80">
                        {deviceStats && deviceStats.length > 0 ? (
                            <Doughnut data={deviceData} options={chartOptions} />
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                {t('common.noResults')}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.topPerformingLinks')}</h3>
                    <div className="space-y-4">
                        {[...links]
                            .sort((a, b) => (b.visits_count || 0) - (a.visits_count || 0))
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
                                            {link.visits_count || 0} {t('links.visits')}
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

// Attach PropTypes to the component
EnhancedStats.propTypes = propTypes; 