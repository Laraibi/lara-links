import React, { useEffect, useState } from "react";

export default function DashboardLinks() {
    const [links, setLinks] = useState([]);

    useEffect(() => {
        fetch("/links")
            .then((response) => response.json())
            .then((data) => setLinks(data));
    }, []);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            {links.map((link) => (
                <a href={route('link.stats',link.id)}>
                    <div
                        key={link.id}
                        className="p-4 bg-white shadow-md rounded-lg cursor-pointer hover:shadow-lg"
                        onClick={() => console.log("link clicked")}
                    >
                        <h3 className="text-lg font-bold text-gray-800">
                            {link.original}
                        </h3>
                        <p className="text-sm text-gray-500">{link.code}</p>
                        <p className="text-xl font-semibold text-blue-600 mt-2">
                            {link.visits_count} visits
                        </p>
                    </div>
                </a>
            ))}
        </div>
    );
}
