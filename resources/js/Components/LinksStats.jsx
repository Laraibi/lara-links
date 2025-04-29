import React from "react";
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";

// Register the required components
ChartJS.register(
    LineElement,
    PointElement,
    LineController,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

export default function LinkStats({ stats }) {
    const visitsByDate = {
        labels: stats.visits_by_date?.map((v) => v.date) || [],
        datasets: [
            {
                label: "Visits",
                data: stats.visits_by_date?.map((v) => v.total) || [],
                borderColor: "#4A90E2",
                backgroundColor: "rgba(74, 144, 226, 0.2)",
                borderWidth: 2,
                fill: true,
            },
        ],
    };

    const visitsByCountry = {
        labels: stats.visits_by_country?.map((v) => v.country) || [],
        datasets: [
            {
                label: "Visits by Country",
                data: stats.visits_by_country?.map((v) => v.total) || [],
                backgroundColor: [
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                    "#FF9F40",
                ],
            },
        ],
    };

    const visitsByLanguage = {
        labels: stats.visits_by_language?.map((v) => v.language) || [],
        datasets: [
            {
                label: "Visits by Language",
                data: stats.visits_by_language?.map((v) => v.total) || [],
                backgroundColor: [
                    "#FF9F40",
                    "#FF6384",
                    "#36A2EB",
                    "#FFCE56",
                    "#4BC0C0",
                    "#9966FF",
                ],
            },
        ],
    };

    const visitsByCity = {
        labels: stats.visits_by_city?.map((v) => v.city) || [],
        datasets: [
            {
                label: "Visits by City",
                data: stats.visits_by_city?.map((v) => v.total) || [],
                backgroundColor: [
                    "#4BC0C0",
                    "#9966FF",
                    "#FF6384",
                    "#FFCE56",
                    "#36A2EB",
                    "#FF9F40",
                ],
            },
        ],
    };

    return (
        <div className="mt-8 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Link Statistics
            </h2>
            <p className="text-gray-600 mb-8">
                Explore detailed statistics for the selected link, including
                visits over time, geographic distribution, and languages used.
            </p>

            {/* Line Chart for Visits Over Time */}
            <div className="mb-12">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">
                    Visits Over Time
                </h3>
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <Line data={visitsByDate} />
                </div>
            </div>

            {/* Row of Pie Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Visits by Country */}
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                        Visits by Country
                    </h3>
                    <Pie data={visitsByCountry} />
                </div>

                {/* Visits by Language */}
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                        Visits by Language
                    </h3>
                    <Pie data={visitsByLanguage} />
                </div>

                {/* Visits by City */}
                <div className="p-4 bg-white shadow-md rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
                        Visits by City
                    </h3>
                    <Pie data={visitsByCity} />
                </div>
            </div>
        </div>
    );
}
