import React, { useState, useEffect } from "react";
import { FaDownload, FaSync } from "react-icons/fa";
import axios from "axios";
import { router } from '@inertiajs/react';
import { useTranslation } from 'react-i18next';

export default function QrCodeModal({
    isOpen,
    onClose,
    link,
    onQrCodeGenerated,
}) {
    const { t } = useTranslation();
    const [qrCodeUrl, setQrCodeUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Check for existing QR code when modal is opened
    useEffect(() => {
        if (isOpen && link) {
            // If the link already has a QR code URL, use it
            if (link.qr_code_url) {
                setQrCodeUrl(link.qr_code_url);
            } else {
                // Otherwise, check with the backend if a QR code exists
                checkExistingQrCode();
            }
        }
    }, [isOpen, link]);

    const checkExistingQrCode = async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Make a GET request to check if a QR code exists
            const response = await axios.get(route('link.get-qr-code', { link: link.id }));
            if (response.data.qr_code_url) {
                setQrCodeUrl(response.data.qr_code_url);
                // Call the callback to update the parent component
                if (onQrCodeGenerated) {
                    onQrCodeGenerated(response.data.qr_code_url);
                }
            }
        } catch (error) {
            // If the error is 404, it means no QR code exists yet
            if (error.response && error.response.status === 404) {
                // No QR code exists yet, which is fine
                setQrCodeUrl(null);
            } else {
                setError(t('links.qrCodeCheckError'));
                console.error("Failed to check for existing QR code:", error);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const generateQrCode = async (regenerate = false) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                route('link.qr-code', { 
                    link: link.id,
                    regenerate: regenerate 
                })
            );
            const newQrCodeUrl = response.data.qr_code_url;
            setQrCodeUrl(newQrCodeUrl);

            // Call the callback to update the parent component
            if (onQrCodeGenerated) {
                onQrCodeGenerated(newQrCodeUrl);
            }
        } catch (error) {
            setError(t('links.qrCodeGenerateError'));
            console.error("Failed to generate QR code:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = () => {
        if (qrCodeUrl) {
            const link = document.createElement("a");
            link.href = qrCodeUrl;
            link.download = `qr-code-${link.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {t('links.qrCodeFor', { name: link.name })}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="py-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-2 text-gray-600">
                            {t('links.generatingQrCode')}
                        </p>
                    </div>
                ) : qrCodeUrl ? (
                    <div className="mt-4">
                        <img
                            src={qrCodeUrl}
                            alt={t('links.qrCode')}
                            className="w-48 h-48 mb-4 mx-auto"
                        />
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleDownload}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                <FaDownload className="mr-2" />
                                {t('links.downloadQrCode')}
                            </button>
                            <button
                                onClick={() => generateQrCode(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                <FaSync className="mr-2" />
                                {t('links.regenerateQrCode')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <button
                            onClick={() => generateQrCode()}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('links.generateQrCode')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
