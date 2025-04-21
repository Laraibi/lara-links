import React, { useState, useEffect } from "react";
import { FaExternalLinkAlt, FaChartLine, FaClock, FaCopy, FaCheck, FaChartBar, FaChevronLeft, FaChevronRight, FaLink, FaTrash, FaSearch, FaEdit, FaSave } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { usePage, router } from "@inertiajs/react";
import { useSelector, useDispatch } from "react-redux";
import { setLinks, addLink, removeLink, updateLink } from "@/store/linksSlice";
import Pagination from "@/Components/Pagination";
import ConfirmationDialog from "@/Components/ConfirmationDialog";

export default function DashboardLinks({ initialLinks = [] }) {
    const dispatch = useDispatch();
    const links = useSelector((state) => state.links.links);
    const [copied, setCopied] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [editingLinkId, setEditingLinkId] = useState(null);
    const [editingName, setEditingName] = useState("");
    const [pendingUpdates, setPendingUpdates] = useState({});
    const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, linkId: null, linkName: null });
    const linksPerPage = 6;
    const { props } = usePage();

    // Log the current state
    useEffect(() => {
        console.log("DashboardLinks - Current Redux links:", links);
        console.log("DashboardLinks - Initial links prop:", initialLinks);
        console.log("DashboardLinks - Props links:", props.links);
    }, [links, initialLinks, props.links]);

    // Initialize Redux state with initial links only once when component mounts
    useEffect(() => {
        if (initialLinks.length > 0 && links.length === 0) {
            dispatch(setLinks(initialLinks));
        }
    }, [initialLinks, dispatch, links.length]);

    // Filter links based on search term
    const filteredLinks = links.filter(link => {
        const searchLower = searchTerm.toLowerCase();
        return (
            (link.name && link.name.toLowerCase().includes(searchLower)) ||
            link.original.toLowerCase().includes(searchLower) ||
            link.code.toLowerCase().includes(searchLower)
        );
    });

    // Pagination
    const indexOfLastLink = currentPage * linksPerPage;
    const indexOfFirstLink = indexOfLastLink - linksPerPage;
    const currentLinks = filteredLinks.slice(indexOfFirstLink, indexOfLastLink);
    const totalPages = Math.ceil(filteredLinks.length / linksPerPage);

    const handleCopy = (code) => {
        const shortUrl = `${window.location.origin}/${code}`;
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(code);
            setTimeout(() => setCopied(null), 2000);
        });
    };

    const handleDelete = (linkId, linkName) => {
        setDeleteDialog({
            isOpen: true,
            linkId,
            linkName: linkName || "Unnamed Link"
        });
    };

    const confirmDelete = () => {
        if (deleteDialog.linkId) {
            router.delete(`/links/${deleteDialog.linkId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    dispatch(removeLink(deleteDialog.linkId));
                    setDeleteDialog({ isOpen: false, linkId: null, linkName: null });
                },
            });
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const startEditing = (link) => {
        setEditingLinkId(link.id);
        setEditingName(link.name || "");
    };

    const handleNameChange = (e) => {
        setEditingName(e.target.value);
    };

    const saveEdit = (linkId) => {
        const currentName = editingName.trim();
        if (currentName !== "") {
            // Store the current name and link ID
            const nameToSave = currentName;
            
            // Reset editing state
            setEditingLinkId(null);
            setEditingName("");
            
            // Create a unique key for this update
            const updateKey = `${linkId}-${Date.now()}`;
            
            // Store this update in pending updates
            setPendingUpdates(prev => ({
                ...prev,
                [updateKey]: { linkId, name: nameToSave }
            }));
            
            // Send the request to the server
            router.put(`/links/${linkId}`, { 
                name: nameToSave
            }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Update Redux store with the new name
                    const updatedLink = { ...links.find(link => link.id === linkId), name: nameToSave };
                    dispatch(updateLink(updatedLink));
                    
                    // Remove this update from pending updates
                    setPendingUpdates(prev => {
                        const newUpdates = { ...prev };
                        delete newUpdates[updateKey];
                        return newUpdates;
                    });
                },
                onError: () => {
                    // If the server update fails, revert the Redux store
                    const originalLink = links.find(link => link.id === linkId);
                    dispatch(updateLink(originalLink));
                    
                    // Remove this update from pending updates
                    setPendingUpdates(prev => {
                        const newUpdates = { ...prev };
                        delete newUpdates[updateKey];
                        return newUpdates;
                    });
                }
            });
        } else {
            setEditingLinkId(null);
            setEditingName("");
        }
    };

    const cancelEdit = () => {
        setEditingLinkId(null);
        setEditingName("");
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search links..."
                            className="pl-10 w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                    </div>
                </div>

                {currentLinks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentLinks.map((link) => (
                            <motion.div
                                key={link.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                            >
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 flex items-center space-x-2">
                                            {editingLinkId === link.id ? (
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={editingName}
                                                        onChange={handleNameChange}
                                                        placeholder="Enter link name"
                                                        className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md text-sm"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                saveEdit(link.id);
                                                            } else if (e.key === 'Escape') {
                                                                cancelEdit();
                                                            }
                                                        }}
                                                    />
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <button
                                                            onClick={() => saveEdit(link.id)}
                                                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        >
                                                            <FaSave className="mr-1 h-3 w-3" />
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={cancelEdit}
                                                            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <h3 className="text-lg font-medium text-gray-900 truncate">
                                                        {link.name || "Unnamed Link"}
                                                    </h3>
                                                    <button
                                                        onClick={() => startEditing(link)}
                                                        className="inline-flex items-center p-1 border border-transparent text-sm rounded-full text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                                        title="Edit link name"
                                                    >
                                                        <FaEdit className="h-3.5 w-3.5" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                        {!editingLinkId && (
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => router.visit(`/links/stats/${link.id}`)}
                                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-emerald-700 bg-emerald-100 hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                                                    title="View link statistics"
                                                >
                                                    <FaChartBar className="mr-1 h-3 w-3" />
                                                    Stats
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id, link.name)}
                                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    title="Delete link"
                                                >
                                                    <FaTrash className="mr-1 h-3 w-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 truncate mb-3">
                                        {link.original}
                                    </p>
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                        <span className="text-gray-700 font-mono text-sm truncate">
                                            {window.location.origin}/{link.code}
                                        </span>
                                        <button
                                            className="ml-2 inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => handleCopy(link.code)}
                                        >
                                            {copied === link.code ? (
                                                <>
                                                    <FaCheck className="mr-1 h-3 w-3" />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <FaCopy className="mr-1 h-3 w-3" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="mt-3 text-xs text-gray-500">
                                        Created: {new Date(link.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="mt-2 flex items-center text-xs text-gray-500">
                                        <FaChartLine className="mr-1 h-3 w-3" />
                                        {link.visits_count || 0} visits
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No links found.</p>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            <ConfirmationDialog
                isOpen={deleteDialog.isOpen}
                onClose={() => setDeleteDialog({ isOpen: false, linkId: null, linkName: null })}
                onConfirm={confirmDelete}
                title="Delete Link"
                message={`Are you sure you want to delete "${deleteDialog.linkName}"? This action cannot be undone.`}
            />
        </div>
    );
}
