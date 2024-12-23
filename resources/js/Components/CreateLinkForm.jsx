import { useState } from "react";
import TextInput from "@/Components/TextInput";
import PrimaryButton from "@/Components/PrimaryButton";
import InputError from "@/Components/InputError";
import { FaCopy } from "react-icons/fa6";

export default function CreateLinkForm() {
    const [url, setUrl] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false); // New state for "Copied" feedback

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch("/links", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute("content"),
                },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            if (data.success) {
                setFeedback({
                    type: "success",
                    message: data.message,
                    short_url: data.data.short_url,
                });
                setUrl("");
            } else {
                setFeedback({ type: "error", message: data.message });
            }
        } catch (error) {
            setFeedback({
                type: "error",
                message: "An unexpected error occurred.",
            });
        } finally {
            setLoading(false);
        }
    };
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true); // Set "Copied" state to true
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        });
    };

    return (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Create a Short Link
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* URL Input */}
                <div>
                    <TextInput
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="Enter URL to shorten"
                        className="w-full border border-gray-300 rounded-md p-2"
                    />
                    <InputError
                        message={
                            feedback?.type === "error" ? feedback.message : ""
                        }
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <PrimaryButton disabled={loading}>
                        {loading ? (
                            <div className="flex items-center">
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

            {/* Feedback Message */}
            {feedback && (
                <div
                    className={`mt-4 p-4 rounded-md text-sm ${
                        feedback.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-700"
                            : "bg-red-50 border border-red-200 text-red-700"
                    }`}
                >
                    <p>{feedback.message}</p>
                    {feedback.short_url && (
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-gray-700">
                                {feedback.short_url}
                            </span>
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                    type="button"
                                    onClick={() =>
                                        handleCopy(feedback.short_url)
                                    }
                                >
                                    <FaCopy size="1.2em" className="mr-1" />
                                    Copy
                                </button>
                                {copied && (
                                    <span className="text-green-600 text-sm">
                                        Copied!
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
