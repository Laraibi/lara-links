import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function ConfirmationDialog({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    >
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <div className="flex items-center justify-center mb-4">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                            
                            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                                {title}
                            </h3>
                            
                            <p className="text-sm text-gray-500 text-center mb-6">
                                {message}
                            </p>
                            
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
} 