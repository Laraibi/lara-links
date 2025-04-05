import React from 'react';
import { FaLink } from 'react-icons/fa';

export default function ApplicationLogo({ className }) {
    return (
        <div className={`flex items-center ${className}`}>
            <FaLink className="h-8 w-8 text-indigo-600" />
            <span className="ml-2 text-xl font-bold text-gray-800">LaraLinks</span>
        </div>
    );
}
