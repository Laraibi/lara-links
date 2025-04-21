import React, { useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaTimes } from 'react-icons/fa';

export default function Notification({ message, type = 'success', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const bgColor = type === 'success' ? 'bg-green-50' : 'bg-red-50';
    const textColor = type === 'success' ? 'text-green-800' : 'text-red-800';
    const borderColor = type === 'success' ? 'border-green-200' : 'border-red-200';
    const Icon = type === 'success' ? FaCheckCircle : FaTimesCircle;

    return (
        <div className={`fixed top-4 right-4 z-50 rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg`}>
            <div className="flex items-center">
                <Icon className={`h-5 w-5 ${textColor} mr-2`} />
                <p className={`text-sm font-medium ${textColor}`}>{message}</p>
                <button
                    onClick={onClose}
                    className="ml-4 text-gray-400 hover:text-gray-500"
                >
                    <FaTimes className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
} 