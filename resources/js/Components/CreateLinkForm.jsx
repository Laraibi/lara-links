import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

export default function CreateLinkForm() {
    const { flash } = usePage().props;
    const { data, setData, post, processing, errors, reset } = useForm({
        url: '',
        code: ''
    });
    
    const [successMessage, setSuccessMessage] = useState(null);
    
    // Handle flash messages
    useEffect(() => {
        if (flash?.data) {
            setSuccessMessage(flash.data);
            // Clear success message after 5 seconds
            const timer = setTimeout(() => {
                setSuccessMessage(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/links', {
            onSuccess: () => {
                reset();
            }
        });
    };
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };
    
    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Create Short Link
            </h2>
            
            {/* Success Message */}
            {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="text-green-700 font-medium mb-2">
                        Link created successfully!
                    </div>
                    <div className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <span className="text-gray-600">
                            {successMessage.short_url}
                        </span>
                        <button
                            onClick={() => copyToClipboard(successMessage.short_url)}
                            className="text-green-600 hover:text-green-700 text-sm"
                            type="button"
                        >
                            Copy
                        </button>
                    </div>
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div>
                    <InputLabel htmlFor="url" value="URL to Shorten" />
                    <TextInput
                        id="url"
                        name="url"
                        type="url"
                        value={data.url}
                        className="mt-1 block w-full"
                        onChange={handleChange}
                        required
                        placeholder="https://example.com"
                    />
                    <InputError message={errors.url} className="mt-2" />
                </div>
                
                {/* Submit Button */}
                <div className="flex items-center justify-end">
                    <PrimaryButton 
                        disabled={processing}
                        className="w-full sm:w-auto"
                    >
                        {processing ? 'Creating...' : 'Create Short Link'}
                    </PrimaryButton>
                </div>
            </form>
        </div>
    );
}