import React, { useState, useRef, useEffect } from 'react';
import { FaCopy, FaChartLine, FaTrash, FaEdit, FaCheck, FaTimes, FaQrcode } from 'react-icons/fa';
import { Link, useForm } from '@inertiajs/react';
import Notification from './Notification';
import { useDispatch, useSelector } from 'react-redux';
import { updateLink, deleteLink, setLinks } from '@/store/linksSlice';
import QrCodeModal from './QrCodeModal';

export default function LinksCard({ links: initialLinks }) {
    const dispatch = useDispatch();
    const links = useSelector(state => state.links.links);
    const [copiedLink, setCopiedLink] = useState(null);
    const [notification, setNotification] = useState(null);
    const [editingLinkId, setEditingLinkId] = useState(null);
    const [editingName, setEditingName] = useState('');
    const [qrCodeModal, setQrCodeModal] = useState({ isOpen: false, link: null });
    const inputRef = useRef(null);
    const { delete: destroy, processing: deleteProcessing } = useForm();
    const { data, setData, put, processing: updateProcessing, errors, reset } = useForm({
        name: '',
    });

    // Initialize Redux store with initial links
    useEffect(() => {
        dispatch(setLinks(initialLinks));
    }, [initialLinks, dispatch]);

    // Focus the input when editing starts
    useEffect(() => {
        if (editingLinkId && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editingLinkId]);

    const handleCopy = async (shortUrl) => {
        try {
            await navigator.clipboard.writeText(shortUrl);
            setCopiedLink(shortUrl);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleDelete = (link) => {
        if (confirm('Are you sure you want to delete this link?')) {
            destroy(route('links.destroy', link), {
                preserveScroll: true,
                onSuccess: () => {
                    dispatch(deleteLink(link.id));
                    setNotification({
                        type: 'success',
                        message: 'Link deleted successfully!'
                    });
                },
                onError: () => {
                    setNotification({
                        type: 'error',
                        message: 'Failed to delete link. Please try again.'
                    });
                }
            });
        }
    };

    const startEditing = (link) => {
        setEditingLinkId(link.id);
        setEditingName(link.name || '');
    };

    const cancelEditing = () => {
        setEditingLinkId(null);
        setEditingName('');
    };

    const handleUpdate = (link) => {
        put(route('links.update', link), {
            preserveScroll: true,
            onSuccess: () => {
                dispatch(updateLink({ id: link.id, name: editingName }));
                setEditingLinkId(null);
                setEditingName('');
                setNotification({
                    type: 'success',
                    message: 'Link updated successfully!'
                });
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Failed to update link. Please try again.'
                });
            }
        });
    };

    const handleKeyDown = (e, link) => {
        if (e.key === 'Enter') {
            handleUpdate(link);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    const openQrCodeModal = (link) => {
        setQrCodeModal({ isOpen: true, link });
    };

    const closeQrCodeModal = () => {
        setQrCodeModal({ isOpen: false, link: null });
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                {links.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {links.map((link) => (
                            <div key={link.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        {editingLinkId === link.id ? (
                                            <input
                                                ref={inputRef}
                                                type="text"
                                                value={editingName}
                                                onChange={(e) => setEditingName(e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, link)}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                                placeholder="Enter link name"
                                            />
                                        ) : (
                                            <h3 className="text-lg font-medium text-gray-900 truncate">
                                                {link.name || 'Unnamed Link'}
                                            </h3>
                                        )}
                                        <p className="mt-1 text-sm text-gray-500 truncate">
                                            {window.location.origin}/{link.code}
                                        </p>
                                        <p className="mt-1 text-sm text-gray-500 truncate">
                                            {link.original}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                                        <button
                                            onClick={() => handleCopy(`${window.location.origin}/${link.code}`)}
                                            className="text-gray-400 hover:text-gray-500"
                                            title="Copy link"
                                        >
                                            {copiedLink === `${window.location.origin}/${link.code}` ? (
                                                <FaCheck className="h-5 w-5 text-green-500" />
                                            ) : (
                                                <FaCopy className="h-5 w-5" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => openQrCodeModal(link)}
                                            className="text-gray-400 hover:text-gray-500"
                                            title={link.qr_code_path ? "View QR Code" : "Generate QR Code"}
                                        >
                                            <FaQrcode className="h-5 w-5" />
                                        </button>
                                        <Link
                                            href={route('link.stats', { link: link.id })}
                                            className="text-gray-400 hover:text-gray-500"
                                            title="View statistics"
                                        >
                                            <FaChartLine className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => startEditing(link)}
                                            className="text-gray-400 hover:text-gray-500"
                                            title="Edit link"
                                        >
                                            <FaEdit className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(link)}
                                            disabled={deleteProcessing}
                                            className="text-gray-400 hover:text-gray-500 disabled:opacity-50"
                                            title="Delete link"
                                        >
                                            <FaTrash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span>{link.visits_count} visits</span>
                                        <span className="mx-2">•</span>
                                        <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                                    </div>
                                    {editingLinkId === link.id && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleUpdate(link)}
                                                disabled={updateProcessing}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                            >
                                                <FaCheck className="h-4 w-4 mr-1" />
                                                Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <FaTimes className="h-4 w-4 mr-1" />
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No links found.</p>
                    </div>
                )}

                {notification && (
                    <Notification
                        type={notification.type}
                        message={notification.message}
                        onClose={() => setNotification(null)}
                    />
                )}

                <QrCodeModal
                    isOpen={qrCodeModal.isOpen}
                    onClose={closeQrCodeModal}
                    link={qrCodeModal.link}
                />
            </div>
        </div>
    );
} 