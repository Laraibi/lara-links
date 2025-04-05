import { useState } from "react";
import { useDispatch } from "react-redux";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import { FaCopy, FaLink, FaCheck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { router } from "@inertiajs/react";
import { addLink } from "@/store/linksSlice";

export default function CreateLinkForm() {
    const dispatch = useDispatch();
    const [url, setUrl] = useState("");
    const [name, setName] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);
        
        try {
            router.post("/links", { url, name }, {
                preserveScroll: true,
                onSuccess: (page) => {
                    // Check if we have a new link in the flash data
                    if (page.props.flash && page.props.flash.new_link) {
                        // Update Redux store with the new link
                        dispatch(addLink(page.props.flash.new_link));
                        
                        // Show success feedback
                        setFeedback({
                            type: "success",
                            message: "Link shortened successfully!",
                            short_url: `${window.location.origin}/${page.props.flash.new_link.code}`,
                        });
                        setUrl("");
                        setName("");
                    } 
                    // If no flash data but links array has been updated, find the new link
                    else if (page.props.links && page.props.links.length > 0) {
                        // Find the most recently created link (assuming it's the one we just created)
                        const newLink = page.props.links[0]; // Assuming links are sorted by created_at desc
                        
                        if (newLink) {
                            // Update Redux store with the new link
                            dispatch(addLink(newLink));
                            
                            // Show success feedback
                            setFeedback({
                                type: "success",
                                message: "Link shortened successfully!",
                                short_url: `${window.location.origin}/${newLink.code}`,
                            });
                            setUrl("");
                            setName("");
                        } else {
                            setFeedback({ 
                                type: "error", 
                                message: "An error occurred while shortening the link." 
                            });
                        }
                    } else {
                        setFeedback({ 
                            type: "error", 
                            message: "An error occurred while shortening the link." 
                        });
                    }
                },
                onError: (errors) => {
                    setFeedback({ 
                        type: "error", 
                        message: errors.url || "An error occurred." 
                    });
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            setFeedback({
                type: "error",
                message: "An unexpected error occurred.",
            });
            setLoading(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaLink className="h-5 w-5 text-gray-400" />
                        </div>
                        <TextInput
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter URL to shorten"
                            className="pl-10 w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                        <InputError
                            message={feedback?.type === "error" ? feedback.message : ""}
                        />
                    </div>
                    
                    <div className="relative">
                        <TextInput
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Link name (optional)"
                            className="w-full border-gray-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg"
                        />
                    </div>

                    <div className="flex justify-end">
                        <PrimaryButton
                            disabled={loading}
                            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8v8H4z"
                                        ></path>
                                    </svg>
                                    Shortening...
                                </div>
                            ) : (
                                "Shorten URL"
                            )}
                        </PrimaryButton>
                    </div>
                </form>

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className={`mt-4 p-4 rounded-lg ${
                                feedback.type === "success"
                                    ? "bg-green-50 border border-green-200"
                                    : "bg-red-50 border border-red-200"
                            }`}
                        >
                            <p className={`text-sm ${
                                feedback.type === "success" ? "text-green-700" : "text-red-700"
                            }`}>
                                {feedback.message}
                            </p>
                            {feedback.short_url && (
                                <div className="mt-3 flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                    <span className="text-gray-700 font-mono text-sm truncate">
                                        {feedback.short_url}
                                    </span>
                                    <button
                                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        type="button"
                                        onClick={() => handleCopy(feedback.short_url)}
                                    >
                                        {copied ? (
                                            <>
                                                <FaCheck className="mr-2 h-4 w-4" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <FaCopy className="mr-2 h-4 w-4" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
