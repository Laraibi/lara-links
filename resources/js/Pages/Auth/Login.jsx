import { useEffect, useState } from 'react';
import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import { FaLink, FaUser } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function Login({ status, canResetPassword }) {
    const { t } = useTranslation();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const [isDemoLogin, setIsDemoLogin] = useState(false);

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    useEffect(() => {
        if (isDemoLogin && data.email === "demo@example.com" && data.password === "demo123") {
            post(route("login"));
            setIsDemoLogin(false);
        }
    }, [data, isDemoLogin]);

    const submit = (e) => {
        e.preventDefault();
        post(route("login"));
    };

    const loginAsDemo = () => {
        setData({
            email: "demo@example.com",
            password: "demo123",
            remember: false,
        });
        setIsDemoLogin(true);
    };

    return (
        <GuestLayout>
            <Head title={t('auth.login')} />

            {status && (
                <div className="mb-4 font-medium text-sm text-green-600">
                    {status}
                </div>
            )}

            <div className="absolute top-4 right-4">
                <LanguageSwitcher />
            </div>

            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                    <FaLink className="h-12 w-12 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">LaraLinks</h1>
                <p className="mt-2 text-gray-600">
                    {t('common.appDescription')}
                </p>
            </div>

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value={t('auth.email')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData("email", e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={t('auth.password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData("password", e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block mt-4">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData("remember", e.target.checked)
                            }
                        />
                        <span className="ml-2 text-sm text-gray-600">
                            {t('auth.rememberMe')}
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-between mt-4">
                    {canResetPassword && (
                        <Link
                            href={route("password.request")}
                            className="text-sm text-indigo-600 hover:text-indigo-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            {t('auth.forgotPassword')}
                        </Link>
                    )}

                    <Link
                        href={route("register")}
                        className="text-sm text-indigo-600 hover:text-indigo-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        {t('auth.needAccount')}
                    </Link>
                </div>

                <div className="mt-6">
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={processing}
                    >
                        {t('auth.login')}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{t('common.or')}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <button
                        type="button"
                        onClick={loginAsDemo}
                        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        disabled={processing}
                    >
                        <FaUser className="mr-2 h-4 w-4 text-indigo-500" />
                        {t('auth.loginAsDemo')}
                    </button>
                </div>
            </div>
        </GuestLayout>
    );
}
