import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { FaPlus, FaTimes, FaCopy } from 'react-icons/fa';
import Notification from './Notification';
import { useTranslation } from 'react-i18next';

export default function CreateLinkModal() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [notification, setNotification] = useState(null);
    const [generatedLink, setGeneratedLink] = useState(null);
    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        name: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('links.store'), {
            onSuccess: (response) => {
                if (response.props.flash.new_link) {
                    const shortUrl = `${window.location.origin}/${response.props.flash.new_link.code}`;
                    setGeneratedLink(shortUrl);
                    setNotification({
                        type: 'success',
                        message: t('links.createSuccess')
                    });
                } else {
                    setNotification({
                        type: 'error',
                        message: t('links.createError')
                    });
                }
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: t('links.createError')
                });
            },
        });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(generatedLink);
            setNotification({
                type: 'success',
                message: t('common.copied')
            });
        } catch (err) {
            setNotification({
                type: 'error',
                message: t('links.copyError')
            });
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
            >
                <FaPlus className="mr-2" />
                {t('links.create')}
            </button>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">{t('links.create')}</h3>
                                        <button
                                            type="button"
                                            onClick={() => setIsOpen(false)}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <FaTimes className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                                            {t('links.originalUrl')}
                                        </label>
                                        <input
                                            type="url"
                                            name="url"
                                            id="url"
                                            value={data.url}
                                            onChange={(e) => setData('url', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            required
                                        />
                                        {errors.url && (
                                            <p className="mt-1 text-sm text-red-600">{errors.url}</p>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                            {t('links.enterLinkName')}
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                            placeholder={t('links.unnamedLink')}
                                        />
                                        {errors.name && (
                                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {processing ? t('common.loading') : t('links.createLink')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsOpen(false)}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        {t('common.cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {generatedLink && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">{t('links.createSuccess')}</h3>
                                    <button
                                        type="button"
                                        onClick={() => setGeneratedLink(null)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <FaTimes className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">{t('links.shortUrl')}:</p>
                                    <div className="mt-1 flex items-center">
                                        <input
                                            type="text"
                                            readOnly
                                            value={generatedLink}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            <FaCopy className="h-4 w-4 mr-1" />
                                            {t('common.copy')}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    onClick={() => setGeneratedLink(null)}
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                >
                                    {t('common.close')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 