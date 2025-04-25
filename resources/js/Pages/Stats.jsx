import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FaArrowLeft, FaChartLine, FaGlobe, FaMobile, FaCalendarAlt, FaExternalLinkAlt, FaCopy, FaCheck, FaClock, FaDownload, FaFileExport, FaFilter, FaQrcode, FaToggleOn, FaToggleOff } from 'react-icons/fa';
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
import axios from 'axios';

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

export default function Stats({ link, visits, countryStats, deviceStats, browserStats, platformStats, dailyStats, avgTimeSpent, qrCodeStats, qrCodeDailyStats }) {
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

    // Prepare data for charts using filteredStats instead of original stats
    const dailyData = {
        labels: filteredStats.dailyStats.map(stat => {
            // Format the date to be more readable
            const date = new Date(stat.date);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }),
        datasets: [
            {
                label: 'Visits',
                data: filteredStats.dailyStats.map(stat => stat.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const countryData = {
        labels: filteredStats.countryStats.map(stat => stat.country || 'Unknown'),
        datasets: [
            {
                data: filteredStats.countryStats.map(stat => stat.count),
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
        labels: filteredStats.deviceStats.map(stat => {
            const deviceType = stat.device_type?.toLowerCase() || 'unknown';
            if (deviceType.includes('mobile')) return 'Mobile';
            if (deviceType.includes('tablet')) return 'Tablet';
            if (deviceType.includes('desktop')) return 'Desktop';
            return 'Other';
        }),
        datasets: [
            {
                data: filteredStats.deviceStats.map(stat => stat.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
            },
        ],
    };

    const browserData = {
        labels: filteredStats.browserStats.map(stat => stat.browser || 'Unknown'),
        datasets: [
            {
                data: filteredStats.browserStats.map(stat => stat.count),
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

    const platformData = {
        labels: filteredStats.platformStats.map(stat => stat.platform || 'Unknown'),
        datasets: [
            {
                data: filteredStats.platformStats.map(stat => stat.count),
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

    const handleGenerateQrCode = async () => {
        setQrCodeLoading(true);
        setQrCodeError(null);
        try {
            const response = await axios.post(`/links/${link.id}/qr-code`);
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
                label: 'QR Code Scans',
                data: qrCodeDailyStats.map(stat => stat.count),
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
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

                            {/* Date Range Filter */}
                            <div className="flex items-center space-x-4 mb-6 bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center">
                                    <FaFilter className="text-gray-400 mr-2" />
                                    <span className="text-gray-700 font-medium">Filter by Date:</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center">
                                        <label htmlFor="startDate" className="mr-2 text-sm text-gray-600">From:</label>
                                        <input
                                            type="date"
                                            id="startDate"
                                            name="startDate"
                                            value={dateRange.startDate}
                                            onChange={handleDateChange}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center">
                                        <label htmlFor="endDate" className="mr-2 text-sm text-gray-600">To:</label>
                                        <input
                                            type="date"
                                            id="endDate"
                                            name="endDate"
                                            value={dateRange.endDate}
                                            onChange={handleDateChange}
                                            className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm text-sm"
                                        />
                                    </div>
                                </div>
                                {isLoading && (
                                    <div className="flex items-center text-gray-500">
                                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Updating...
                                    </div>
                                )}
                            </div>

                            {/* Export buttons */}
                            <div className="flex justify-end space-x-2 mb-4">
                                <button
                                    onClick={() => handleExport('csv', 'visits')}
                                    disabled={exporting || isLoading}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    <FaDownload className="mr-2 h-4 w-4" />
                                    Export CSV
                                </button>
                                <button
                                    onClick={() => handleExport('xlsx', 'visits')}
                                    disabled={exporting || isLoading}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                                >
                                    <FaFileExport className="mr-2 h-4 w-4" />
                                    Export Excel
                                </button>
                            </div>

                            {/* Stats Overview Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-white border border-gray-200 rounded-lg shadow-sm p-6"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500">Total Visits</p>
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
                                            <p className="text-sm font-medium text-gray-500">Countries</p>
                                            <p className="text-3xl font-bold text-gray-900">{filteredStats.countryStats.length}</p>
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
                                            <p className="text-3xl font-bold text-gray-900">{filteredStats.deviceStats.length}</p>
                                        </div>
                                        <div className="bg-amber-100 p-3 rounded-full">
                                            <FaMobile className="h-6 w-6 text-amber-600" />
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
                                            <p className="text-sm font-medium text-gray-500">Avg. Time Spent</p>
                                            <p className="text-3xl font-bold text-gray-900">{Math.round(filteredStats.avgTimeSpent)}s</p>
                                        </div>
                                        <div className="bg-purple-100 p-3 rounded-full">
                                            <FaClock className="h-6 w-6 text-purple-600" />
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
                                        <button
                                            onClick={() => setActiveTab('qr-code')}
                                            className={`${
                                                activeTab === 'qr-code'
                                                    ? 'border-indigo-500 text-indigo-600'
                                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                                        >
                                            <FaQrcode className="mr-2" />
                                            QR Code
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
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center h-full">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                    </div>
                                                ) : filteredStats.dailyStats.length > 0 ? (
                                                    <Line 
                                                        data={dailyData} 
                                                        options={{
                                                            ...chartOptions,
                                                            scales: {
                                                                y: {
                                                                    beginAtZero: true,
                                                                    ticks: {
                                                                        precision: 0,
                                                                        stepSize: 1
                                                                    }
                                                                }
                                                            }
                                                        }} 
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-500">
                                                        No visit data available for the selected date range
                                                    </div>
                                                )}
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
                                            {isLoading ? (
                                                <div className="flex items-center justify-center h-full">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                </div>
                                            ) : filteredStats.dailyStats.length > 0 ? (
                                                <Line 
                                                    data={dailyData} 
                                                    options={{
                                                        ...chartOptions,
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                ticks: {
                                                                    precision: 0,
                                                                    stepSize: 1
                                                                }
                                                            }
                                                        }
                                                    }} 
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-500">
                                                    No visit data available for the selected date range
                                                </div>
                                            )}
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

                                {/* Add new charts for browser and platform stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-white p-6 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Browser Distribution</h3>
                                        <Doughnut data={browserData} options={chartOptions} />
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-sm">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Distribution</h3>
                                        <Doughnut data={platformData} options={chartOptions} />
                                    </div>
                                </div>

                                {/* Enhanced Analytics Section */}
                                {report && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Peak Hours</h3>
                                            <div className="h-64">
                                                <Bar
                                                    data={{
                                                        labels: Object.keys(report.peak_hours),
                                                        datasets: [{
                                                            label: 'Visits',
                                                            data: Object.values(report.peak_hours),
                                                            backgroundColor: 'rgba(99, 102, 241, 0.8)',
                                                        }]
                                                    }}
                                                    options={{
                                                        ...chartOptions,
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                title: {
                                                                    display: true,
                                                                    text: 'Number of Visits'
                                                                }
                                                            },
                                                            x: {
                                                                title: {
                                                                    display: true,
                                                                    text: 'Hour of Day'
                                                                }
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-white p-6 rounded-lg shadow-sm">
                                            <h3 className="text-lg font-medium text-gray-900 mb-4">Top Referrers</h3>
                                            <div className="space-y-4">
                                                {Object.entries(report.referrers).map(([url, count]) => (
                                                    <div key={url} className="flex justify-between items-center">
                                                        <span className="text-sm text-gray-600 truncate">{url || 'Direct'}</span>
                                                        <span className="text-sm font-medium text-gray-900">{count}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'qr-code' && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-6"
                                    >
                                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                            <div className="flex items-center justify-between mb-6">
                                                <h3 className="text-lg font-medium text-gray-900">QR Code Management</h3>
                                                <button
                                                    onClick={handleToggleQrCode}
                                                    disabled={qrCodeLoading}
                                                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
                                                        link.qr_code_enabled
                                                            ? 'text-red-700 bg-red-100 hover:bg-red-200'
                                                            : 'text-green-700 bg-green-100 hover:bg-green-200'
                                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                                                >
                                                    {qrCodeLoading ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                                    ) : link.qr_code_enabled ? (
                                                        <>
                                                            <FaToggleOn className="mr-2 h-5 w-5" />
                                                            Disable QR Code
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaToggleOff className="mr-2 h-5 w-5" />
                                                            Enable QR Code
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {qrCodeError && (
                                                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                                    <p className="text-sm text-red-600">{qrCodeError}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg">
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Status</h4>
                                                        <p className="text-lg font-semibold text-gray-900">
                                                            {link.qr_code_enabled ? 'Enabled' : 'Disabled'}
                                                        </p>
                                                    </div>
                                                    
                                                    {link.qr_code_enabled && (
                                                        <>
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="text-sm font-medium text-gray-500 mb-2">QR Code Style</h4>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {link.qr_code_style || 'Default'}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Total Scans</h4>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {qrCodeStats.total}
                                                                </p>
                                                            </div>
                                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                                <h4 className="text-sm font-medium text-gray-500 mb-2">Usage Percentage</h4>
                                                                <p className="text-lg font-semibold text-gray-900">
                                                                    {qrCodeStats.percentage}% of total visits
                                                                </p>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>

                                                {link.qr_code_enabled && (
                                                    <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg">
                                                        {link.qr_code_url ? (
                                                            <>
                                                                <img
                                                                    src={link.qr_code_url}
                                                                    alt="QR Code"
                                                                    className="w-48 h-48 mb-4"
                                                                />
                                                                <div className="flex space-x-2">
                                                                    <a
                                                                        href={link.qr_code_url}
                                                                        download={`qr-code-${link.code}.png`}
                                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                                    >
                                                                        <FaDownload className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </a>
                                                                    <button
                                                                        onClick={handleGenerateQrCode}
                                                                        disabled={qrCodeLoading}
                                                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                                    >
                                                                        <FaQrcode className="mr-2 h-4 w-4" />
                                                                        Regenerate
                                                                    </button>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={handleGenerateQrCode}
                                                                disabled={qrCodeLoading}
                                                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                            >
                                                                <FaQrcode className="mr-2 h-5 w-5" />
                                                                Generate QR Code
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {link.qr_code_enabled && qrCodeDailyStats.length > 0 && (
                                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                                <h3 className="text-lg font-medium text-gray-900 mb-4">QR Code Scan History</h3>
                                                <div className="h-64">
                                                    {isLoading ? (
                                                        <div className="flex items-center justify-center h-full">
                                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                                        </div>
                                                    ) : (
                                                        <Line 
                                                            data={qrCodeData} 
                                                            options={{
                                                                ...chartOptions,
                                                                scales: {
                                                                    y: {
                                                                        beginAtZero: true,
                                                                        ticks: {
                                                                            precision: 0,
                                                                            stepSize: 1
                                                                        }
                                                                    }
                                                                }
                                                            }} 
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        )}
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
                                            {filteredStats.visits.slice(0, 10).map((visit, index) => (
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
