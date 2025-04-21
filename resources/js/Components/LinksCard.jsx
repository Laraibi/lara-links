import React, { useState, useRef, useEffect } from 'react';
import { FaCopy, FaChartLine, FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import { Link, useForm } from '@inertiajs/react';
import Notification from './Notification';
import { useDispatch, useSelector } from 'react-redux';
import { updateLink, deleteLink, setLinks } from '@/store/linksSlice';

export default function LinksCard({ links: initialLinks }) {
    const dispatch = useDispatch();
    const links = useSelector(state => state.links.links);
    const [copiedLink, setCopiedLink] = useState(null);
    const [notification, setNotification] = useState(null);
    const [editingLinkId, setEditingLinkId] = useState(null);
    const [editingName, setEditingName] = useState('');
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
                },
            });
        }
    };

    const startEditing = (link) => {
        setEditingLinkId(link.id);
        setEditingName(link.name || '');
        setData('name', link.name || '');
    };

    const cancelEditing = () => {
        setEditingLinkId(null);
        setEditingName('');
        reset();
    };

    const handleUpdate = (link) => {
        if (!editingName.trim()) {
            setNotification({
                type: 'error',
                message: 'Link name cannot be empty.'
            });
            return;
        }
        
        const trimmedName = editingName.trim();
        const linkId = link.id;
        
        setData('name', trimmedName);
        
        put(route('links.update', linkId), {
            preserveScroll: true,
            onSuccess: (response) => {
                dispatch(updateLink({ id: linkId, name: trimmedName }));
                setNotification({
                    type: 'success',
                    message: 'Link name updated successfully!'
                });
                setEditingLinkId(null);
                setEditingName('');
                reset();
            },
            onError: () => {
                setNotification({
                    type: 'error',
                    message: 'Failed to update link name. Please try again.'
                });
            },
        });
    };

    const handleKeyDown = (e, link) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleUpdate(link);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    return (
        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Links</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {links.map((link) => (
                        <div key={link.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col h-full">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                        {editingLinkId === link.id ? (
                                            <div className="flex-1 flex items-center">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={editingName}
                                                    onChange={(e) => {
                                                        setEditingName(e.target.value);
                                                        setData('name', e.target.value);
                                                    }}
                                                    onKeyDown={(e) => handleKeyDown(e, link)}
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                                    placeholder="Link name"
                                                />
                                                <div className="ml-2 flex space-x-1">
                                                    <button
                                                        onClick={() => handleUpdate(link)}
                                                        disabled={updateProcessing}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <FaCheck className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={cancelEditing}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <FaTimes className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex-1 flex items-center">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {link.name || 'Unnamed Link'}
                                                </p>
                                                <button
                                                    onClick={() => startEditing(link)}
                                                    className="ml-2 text-gray-400 hover:text-gray-600"
                                                >
                                                    <FaEdit className="h-3 w-3" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mt-1">
                                        {link.original}
                                    </p>
                                    <div className="flex items-center mt-1">
                                        <p className="text-sm text-gray-500 truncate">
                                            {window.location.origin}/{link.code}
                                        </p>
                                        <button
                                            onClick={() => handleCopy(`${window.location.origin}/${link.code}`)}
                                            className="ml-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                                        >
                                            {copiedLink === `${window.location.origin}/${link.code}` ? (
                                                <span className="text-green-500">Copied!</span>
                                            ) : (
                                                <FaCopy className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <span>{link.visits_count} visits</span>
                                        <span className="mx-2">•</span>
                                        <span>Created {new Date(link.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <Link
                                            href={route('link.stats', { link: link.id })}
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <FaChartLine className="h-5 w-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(link)}
                                            disabled={deleteProcessing}
                                            className="text-red-600 hover:text-red-800 disabled:opacity-50"
                                        >
                                            <FaTrash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}
        </div>
    );
} 