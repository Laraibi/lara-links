import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { Provider } from 'react-redux';
import store from './store';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Function to initialize i18n with the server-side locale
const initializeI18n = (locale) => {
    if (locale && locale !== i18n.language) {
        i18n.changeLanguage(locale);
        // Also update localStorage to keep it in sync
        localStorage.setItem('i18nextLng', locale);
        document.documentElement.lang = locale;
    }
};

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./Pages/${name}.jsx`, import.meta.glob('./Pages/**/*.jsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Initialize i18n with the server-side locale
        initializeI18n(props.initialPage.props.locale);

        // Wrap the app with necessary providers
        root.render(
            <Provider store={store}>
                <I18nextProvider i18n={i18n}>
                    <App {...props} />
                </I18nextProvider>
            </Provider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
