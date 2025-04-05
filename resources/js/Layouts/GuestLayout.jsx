import { Link } from '@inertiajs/react';
import { FaLink } from 'react-icons/fa';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg">
                {children}
            </div>
            <div className="mt-8 text-center text-sm text-gray-600">
                <p>© {new Date().getFullYear()} LaraLinks. All rights reserved.</p>
            </div>
        </div>
    );
}
