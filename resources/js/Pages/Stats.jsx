import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaArrowLeft, FaChartLine, FaGlobe, FaMobile, FaCalendarAlt, FaExternalLinkAlt, FaCopy, FaCheck, FaClock, FaDownload, FaFileExport, FaFilter, FaQrcode, FaToggleOn, FaToggleOff, FaSync } from 'react-icons/fa';
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
    Filler
} from 'chart.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

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
    Legend,
    Filler
);

export default function Stats({ auth, link, visits, countryStats, deviceStats, browserStats, platformStats, dailyStats, avgTimeSpent, qrCodeStats, qrCodeDailyStats }) {
    const { t, i18n } = useTranslation();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [exporting, setExporting] = useState(false);
    const [report, setReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [qrCodeLoading, setQrCodeLoading] = useState(false);
    const [qrCodeError, setQrCodeError] = useState(null);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
        endDate: new Date().toISOString().split('T')[0] // today
    });
    const [filteredStats, setFilteredStats] = useState({
        visits: visits,
        countryStats: countryStats,
        deviceStats: deviceStats,
        browserStats: browserStats,
        platformStats: platformStats,
        dailyStats: dailyStats,
        avgTimeSpent: avgTimeSpent,
        qrCodeStats: qrCodeStats || {
            total: 0,
            direct: 0,
            percentage: 0
        },
        qrCodeDailyStats: qrCodeDailyStats || []
    });

    // Prepare data for charts using filteredStats
    const deviceData = {
        labels: filteredStats.deviceStats.map(stat => {
            const deviceType = stat.device_type?.toLowerCase() || 'unknown';
            if (deviceType.includes('mobile')) return t('stats.mobileVisits');
            if (deviceType.includes('tablet')) return t('stats.tabletVisits');
            if (deviceType.includes('desktop')) return t('stats.desktopVisits');
            return t('common.unknown');
        }),
        datasets: [
            {
                data: filteredStats.deviceStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',  // Indigo
                    'rgba(16, 185, 129, 0.8)',  // Green
                    'rgba(245, 158, 11, 0.8)',  // Yellow
                    'rgba(239, 68, 68, 0.8)',   // Red
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF',
                hoverOffset: 4,
                label: t('stats.deviceDistribution')
            },
        ],
    };

    const countryData = {
        labels: filteredStats.countryStats.map(stat => stat.country || t('common.unknown')),
        datasets: [
            {
                data: filteredStats.countryStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(245, 158, 11, 0.8)',   // Yellow
                    'rgba(239, 68, 68, 0.8)',    // Red
                    'rgba(139, 92, 246, 0.8)',   // Purple
                    'rgba(14, 165, 233, 0.8)',   // Sky
                    'rgba(236, 72, 153, 0.8)',   // Pink
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF',
                hoverOffset: 4,
                label: t('stats.geographicDistribution')
            },
        ],
    };

    // Add debugging logs for data and chart rendering
    useEffect(() => {
        console.log('Stats Data:', {
            deviceStats,
            countryStats,
            filteredStats,
            chartData: {
                deviceData,
                countryData
            }
        });
    }, [deviceStats, countryStats, filteredStats, deviceData, countryData]);

    // Add effect to ensure language persistence
    useEffect(() => {
        const storedLanguage = localStorage.getItem('i18nextLng');
        if (storedLanguage && storedLanguage !== i18n.language) {
            i18n.changeLanguage(storedLanguage);
        }
    }, []);

    // Add effect to update translations when language changes
    useEffect(() => {
        const handleLanguageChange = () => {
            // Force update of chart data to trigger re-render with new translations
            setFilteredStats(prevStats => ({...prevStats}));
        };

        i18n.on('languageChanged', handleLanguageChange);
        return () => {
            i18n.off('languageChanged', handleLanguageChange);
        };
    }, [i18n]);

    const handleCopy = () => {
        const shortUrl = `${window.location.origin}/${link.code}`;
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handleDateChange = async (e) => {
        const { name, value } = e.target;
        const newDateRange = { ...dateRange, [name]: value };
        setDateRange(newDateRange);
        await fetchFilteredStats(newDateRange);
    };

    const fetchFilteredStats = async (range = dateRange) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/links/stats/${link.id}/filter`, {
                params: {
                    startDate: range.startDate,
                    endDate: range.endDate
                }
            });
            setFilteredStats({
                ...response.data,
                qrCodeStats: response.data.qrCodeStats || {
                    total: 0,
                    direct: 0,
                    percentage: 0
                },
                qrCodeDailyStats: response.data.qrCodeDailyStats || []
            });
        } catch (error) {
            console.error('Failed to fetch filtered stats:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExport = async (format, type = 'visits') => {
        setExporting(true);
        try {
            const response = await axios.get(`/links/stats/${link.id}/export`, {
                params: { 
                    format, 
                    type,
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                },
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            downloadLink.setAttribute('download', `analytics_${format}_${type}_${new Date().toISOString()}.${format}`);
            document.body.appendChild(downloadLink);
            downloadLink.click();
            downloadLink.remove();
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(false);
        }
    };

    const fetchReport = async () => {
        try {
            const response = await axios.get(`/links/stats/${link.id}/report`, {
                params: {
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate
                }
            });
            setReport(response.data);
        } catch (error) {
            console.error('Failed to fetch report:', error);
        }
    };

    useEffect(() => {
        fetchReport();
    }, [link.id, dateRange]);

    const commonChartOptions = {
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
                cornerRadius: 4,
                displayColors: true
            }
        }
    };

    const lineChartOptions = {
        ...commonChartOptions,
        plugins: {
            ...commonChartOptions.plugins,
            legend: {
                ...commonChartOptions.plugins.legend,
                position: 'top'
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            }
        }
    };

    const doughnutChartOptions = {
        ...commonChartOptions,
        cutout: '60%',
        plugins: {
            ...commonChartOptions.plugins,
            legend: {
                ...commonChartOptions.plugins.legend,
                position: 'bottom',
                display: true
            },
            tooltip: {
                ...commonChartOptions.plugins.tooltip,
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

    // Prepare data for charts using filteredStats
    const dailyData = {
        labels: filteredStats.dailyStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: t('stats.dailyVisits'),
                data: filteredStats.dailyStats.map(stat => stat.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgb(99, 102, 241)',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
            },
        ],
    };

    // Add debugging for device data
    useEffect(() => {
        console.log('Device Data:', deviceData);
    }, [deviceData]);

    const browserData = {
        labels: filteredStats.browserStats.map(stat => stat.browser || t('common.unknown')),
        datasets: [
            {
                data: filteredStats.browserStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(245, 158, 11, 0.8)',   // Yellow
                    'rgba(239, 68, 68, 0.8)',    // Red
                    'rgba(139, 92, 246, 0.8)',   // Purple
                    'rgba(14, 165, 233, 0.8)',   // Sky
                    'rgba(236, 72, 153, 0.8)',   // Pink
                ],
                borderWidth: 2,
                borderColor: 'white',
                hoverOffset: 4
            },
        ],
    };

    const platformData = {
        labels: filteredStats.platformStats.map(stat => stat.platform || t('common.unknown')),
        datasets: [
            {
                data: filteredStats.platformStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',   // Indigo
                    'rgba(16, 185, 129, 0.8)',   // Green
                    'rgba(245, 158, 11, 0.8)',   // Yellow
                    'rgba(239, 68, 68, 0.8)',    // Red
                    'rgba(139, 92, 246, 0.8)',   // Purple
                    'rgba(14, 165, 233, 0.8)',   // Sky
                ],
                borderWidth: 2,
                borderColor: 'white',
                hoverOffset: 4
            },
        ],
    };

    // Add console.log to debug the data
    useEffect(() => {
        console.log('Daily Stats:', filteredStats.dailyStats);
    }, [filteredStats.dailyStats]);

    const handleToggleQrCode = async () => {
        setQrCodeLoading(true);
        setQrCodeError(null);
        try {
            const response = await axios.post(`/links/${link.id}/toggle-qr-code`);
            // Update the link object with the new QR code status
            link.qr_code_enabled = response.data.qr_code_enabled;
        } catch (error) {
            setQrCodeError('Failed to toggle QR code status');
            console.error('Failed to toggle QR code:', error);
        } finally {
            setQrCodeLoading(false);
        }
    };

    const handleGenerateQrCode = async (regenerate = false) => {
        setQrCodeLoading(true);
        setQrCodeError(null);
        try {
            const response = await axios.post(`/links/${link.id}/qr-code${regenerate ? '?regenerate=true' : ''}`);
            // Update the link object with the new QR code URL
            link.qr_code_url = response.data.qr_code_url;
        } catch (error) {
            setQrCodeError('Failed to generate QR code');
            console.error('Failed to generate QR code:', error);
        } finally {
            setQrCodeLoading(false);
        }
    };

    // Prepare data for QR code chart
    const qrCodeData = {
        labels: qrCodeDailyStats.map(stat => {
            const date = new Date(stat.date);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: t('stats.qrCodeScans'),
                data: qrCodeDailyStats.map(stat => stat.count),
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center">
                    <button
                        onClick={() => window.history.back()}
                        className="mr-4 text-gray-600 hover:text-gray-900"
                    >
                        <FaArrowLeft className="h-5 w-5" />
                    </button>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        {t('stats.linkStatistics')}
                    </h2>
                </div>
            }
        >
            <Head title={t('stats.linkStatistics')} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Link Info Card */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => window.history.back()}
                                className="flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <span className="mr-2">←</span>
                                {t('common.back')}
                            </button>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleExport('csv', 'visits')}
                                    disabled={exporting}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t('stats.exportCsv')}
                                </button>
                                <button
                                    onClick={() => handleExport('xlsx', 'visits')}
                                    disabled={exporting}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {t('stats.exportExcel')}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 mb-6">
                            <div className="flex-1">
                                <h1 className="text-2xl font-semibold text-gray-900">{link.original}</h1>
                                <div className="mt-1 flex items-center">
                                    <span className="text-sm text-gray-500">{window.location.origin}/{link.code}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="ml-2 text-indigo-600 hover:text-indigo-900"
                                    >
                                        {copied ? t('common.copied') : t('common.copy')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('stats.filterByDate')}</label>
                            <div className="flex space-x-4">
                                <div>
                                    <label className="block text-xs text-gray-500">{t('common.from')}</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={dateRange.startDate}
                                        onChange={handleDateChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500">{t('common.to')}</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={dateRange.endDate}
                                        onChange={handleDateChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs and Content */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`${
                                        activeTab === 'overview'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    <FaChartLine className="h-5 w-5 mx-auto mb-1" />
                                    {t('stats.overview')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('countries')}
                                    className={`${
                                        activeTab === 'countries'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    <FaGlobe className="h-5 w-5 mx-auto mb-1" />
                                    {t('stats.countries')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('devices')}
                                    className={`${
                                        activeTab === 'devices'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    <FaMobile className="h-5 w-5 mx-auto mb-1" />
                                    {t('stats.devices')}
                                </button>
                                <button
                                    onClick={() => setActiveTab('qrcode')}
                                    className={`${
                                        activeTab === 'qrcode'
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm`}
                                >
                                    <FaQrcode className="h-5 w-5 mx-auto mb-1" />
                                    {t('stats.qrCode')}
                                </button>
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'overview' && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">{t('stats.totalVisits')}</p>
                                                    <p className="text-3xl font-bold text-gray-900">{filteredStats.visits.length}</p>
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
                                                    <p className="text-sm font-medium text-gray-500">{t('stats.countries')}</p>
                                                    <p className="text-3xl font-bold text-gray-900">
                                                        {filteredStats.countryStats.length}
                                                    </p>
                                                </div>
                                                <div className="bg-green-100 p-3 rounded-full">
                                                    <FaGlobe className="h-6 w-6 text-green-600" />
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
                                                    <p className="text-sm font-medium text-gray-500">{t('stats.devices')}</p>
                                                    <p className="text-3xl font-bold text-gray-900">
                                                        {filteredStats.deviceStats.length}
                                                    </p>
                                                </div>
                                                <div className="bg-yellow-100 p-3 rounded-full">
                                                    <FaMobile className="h-6 w-6 text-yellow-600" />
                                                </div>
                                            </div>
                                        </motion.div>

                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.4 }}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-500">{t('stats.avgTimeSpent')}</p>
                                                    <p className="text-3xl font-bold text-gray-900">{filteredStats.avgTimeSpent}s</p>
                                                </div>
                                                <div className="bg-purple-100 p-3 rounded-full">
                                                    <FaClock className="h-6 w-6 text-purple-600" />
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.dailyVisits')}</h3>
                                            <div className="h-80">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.dailyStats.length > 0 ? (
                                                    <Line 
                                                        data={dailyData} 
                                                        options={lineChartOptions} 
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        {t('common.noResults')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.geographicDistribution')}</h3>
                                            <div className="h-80">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.countryStats && filteredStats.countryStats.length > 0 ? (
                                                    <Doughnut 
                                                        data={countryData} 
                                                        options={doughnutChartOptions}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        {t('common.noResults')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.deviceDistribution')}</h3>
                                            <div className="h-80">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.deviceStats && filteredStats.deviceStats.length > 0 ? (
                                                    <Doughnut 
                                                        data={deviceData} 
                                                        options={doughnutChartOptions}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        {t('common.noResults')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.browserDistribution')}</h3>
                                            <div className="h-80">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.browserStats.length > 0 ? (
                                                    <Doughnut 
                                                        data={browserData} 
                                                        options={doughnutChartOptions}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        {t('common.noResults')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.platformDistribution')}</h3>
                                            <div className="h-80">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.platformStats.length > 0 ? (
                                                    <Doughnut 
                                                        data={platformData} 
                                                        options={doughnutChartOptions}
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        {t('common.noResults')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {report && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.peakHours')}</h3>
                                                <div className="h-64">
                                                    <Bar
                                                        data={{
                                                            labels: Object.keys(report.peak_hours),
                                                            datasets: [{
                                                                label: t('stats.visits'),
                                                                data: Object.values(report.peak_hours),
                                                                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                                                            }]
                                                        }}
                                                        options={{
                                                            ...lineChartOptions,
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    title: {
                                                                        display: true,
                                                                        text: t('stats.visits')
                                                                    }
                                                                },
                                                                x: {
                                                                    title: {
                                                                        display: true,
                                                                        text: t('stats.hourOfDay')
                                                                    }
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-white p-6 rounded-lg shadow-sm">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('stats.topReferrers')}</h3>
                                                <div className="space-y-4">
                                                    {Object.entries(report.referrers || {}).map(([referrer, count], index) => (
                                                        <div key={index} className="flex items-center justify-between">
                                                            <span className="text-sm text-gray-600 truncate flex-1">{referrer}</span>
                                                            <span className="text-sm font-medium text-gray-900">{count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'countries' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {t('stats.geographicDistribution')}
                                        </h3>
                                        <div className="h-64">
                                            <Doughnut 
                                                data={countryData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'right',
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'devices' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            {t('stats.deviceDistribution')}
                                        </h3>
                                        <div className="h-64">
                                            <Doughnut 
                                                data={deviceData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    plugins: {
                                                        legend: {
                                                            position: 'right',
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'qrcode' && (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {t('stats.qrCodeStatistics')}
                                            </h3>
                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => handleToggleQrCode()}
                                                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                                                >
                                                    {link.qr_code_enabled ? (
                                                        <FaToggleOn className="h-6 w-6 text-indigo-600" />
                                                    ) : (
                                                        <FaToggleOff className="h-6 w-6" />
                                                    )}
                                                    <span className="ml-2">
                                                        {link.qr_code_enabled ? t('qrCode.enabled') : t('qrCode.disabled')}
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                        {link.qr_code_enabled && (
                                            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-500">{t('stats.totalQrScans')}</h4>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{filteredStats.qrCodeStats.total}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-500">{t('stats.directVisits')}</h4>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{filteredStats.qrCodeStats.direct}</p>
                                                </div>
                                                <div className="bg-gray-50 p-4 rounded-lg">
                                                    <h4 className="text-sm font-medium text-gray-500">{t('stats.qrCodePercentage')}</h4>
                                                    <p className="mt-1 text-2xl font-semibold text-gray-900">{filteredStats.qrCodeStats.percentage}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
