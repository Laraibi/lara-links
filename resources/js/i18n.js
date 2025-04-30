import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import Cookies from 'js-cookie';

// Import translation files
import enTranslations from './locales/en/translations.json';
import frTranslations from './locales/fr/translations.json';

// Function to get initial language
const getInitialLanguage = () => {
    // Check Inertia page props first
    const pageProps = window.__INERTIA_PROPS__;
    if (pageProps?.locale) {
        return pageProps.locale;
    }

    // Check cookie
    const cookieLang = Cookies.get('locale');
    if (cookieLang) {
        return cookieLang;
    }

    // Check HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang) {
        return htmlLang;
    }

    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (browserLang) {
        return browserLang;
    }

    // Default to English
    return 'en';
};

// Initialize i18next
i18next
    .use(Backend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            fr: { translation: frTranslations }
        },
        lng: getInitialLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        },
        detection: {
            order: ['cookie', 'htmlTag', 'navigator'],
            caches: ['cookie'],
            cookieOptions: {
                path: '/',
                sameSite: 'lax',
                secure: true,
                httpOnly: false
            }
        }
    });

// Handle language changes
i18next.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
    Cookies.set('locale', lng, {
        path: '/',
        sameSite: 'lax',
        secure: true,
        httpOnly: false
    });
});

// Handle Inertia page visits
document.addEventListener('inertia:success', (event) => {
    const pageProps = event.detail.page.props;
    if (pageProps?.locale && pageProps.locale !== i18next.language) {
        i18next.changeLanguage(pageProps.locale);
    }
});

export default i18next; 