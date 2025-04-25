import React, { useState, useEffect } from 'react';
import { FaQrcode, FaDownload, FaTimes, FaSync } from 'react-icons/fa';
import axios from 'axios';

export default function QrCodeModal({ isOpen, onClose, link }) {
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Reset state when modal opens with a new link
        if (isOpen && link) {
            setQrCodeUrl(null);
            setError(null);
            
            // If the link already has a QR code, use it
            if (link.qr_code_path) {
                setQrCodeUrl(`/storage/${link.qr_code_path}`);
            } else {
                // Otherwise generate a new one
                generateQrCode();
            }
        }
    }, [isOpen, link]);

    const generateQrCode = async (forceRegenerate = false) => {
        if (!link) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/links/${link.id}/qr-code${forceRegenerate ? '?regenerate=true' : ''}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Add source parameter to the URL for tracking
                const url = new URL(data.qr_code_url, window.location.origin);
                url.searchParams.append('source', 'qr');
                setQrCodeUrl(url.toString());
            } else {
                setError(data.error || 'Failed to generate QR code');
            }
        } catch (err) {
            setError('Failed to generate QR code: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (!qrCodeUrl) return;
        
        // Create a temporary link element
        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `qr_${link.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">QR Code</h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <FaTimes />
                    </button>
                </div>
                
                <div className="flex flex-col items-center">
                    {isLoading ? (
                        <div className="py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                            <p className="mt-2 text-gray-600">Generating QR code...</p>
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center">
                            <p className="text-red-500 mb-4">{error}</p>
                            <button
                                onClick={() => generateQrCode()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : qrCodeUrl ? (
                        <div className="mt-4">
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-48 h-48 mb-4"
                            />
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Download QR Code
                            </button>
                        </div>
                    ) : (
                        <div className="py-8 text-center">
                            <p className="text-gray-600 mb-4">No QR code available</p>
                            <button
                                onClick={() => generateQrCode()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                            >
                                Generate QR Code
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 