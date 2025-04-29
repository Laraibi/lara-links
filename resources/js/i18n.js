import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en/translations.json';
import frTranslations from './locales/fr/translations.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  fr: {
    translation: frTranslations,
  },
};

// Function to get initial language from various sources
const getInitialLanguage = () => {
  try {
    // First check cookie
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
    if (localeCookie) {
      const cookieValue = localeCookie.split('=')[1].trim();
      if (['en', 'fr'].includes(cookieValue)) {
        return cookieValue;
      }
    }

    // Then check HTML lang attribute
    const htmlLang = document.documentElement.lang;
    if (htmlLang && ['en', 'fr'].includes(htmlLang)) {
      return htmlLang;
    }

    // Finally check browser language
    const browserLang = navigator.language.split('-')[0];
    if (['en', 'fr'].includes(browserLang)) {
      return browserLang;
    }

    // Default to English
    return 'en';
  } catch (error) {
    console.warn('Error getting initial language:', error);
    return 'en';
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    debug: process.env.NODE_ENV === 'development',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['cookie', 'navigator'],
      caches: ['cookie'],
      lookupCookie: 'locale',
      cookieMinutes: 60 * 24 * 365, // 1 year
    },
    react: {
      useSuspense: false
    }
  });

// Sync language changes across storage mechanisms
i18n.on('languageChanged', (lng) => {
  try {
    // Update cookie
    document.cookie = `locale=${lng};path=/;max-age=${60 * 24 * 365}`;
    
    // Update HTML lang attribute
    document.documentElement.lang = lng;
  } catch (error) {
    console.warn('Error syncing language:', error);
  }
});

// Handle Inertia page visits
document.addEventListener('inertia:before', (event) => {
  try {
    const cookies = document.cookie.split(';');
    const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
    if (localeCookie) {
      const locale = localeCookie.split('=')[1].trim();
      if (locale && locale !== i18n.language) {
        i18n.changeLanguage(locale);
      }
    }
  } catch (error) {
    console.warn('Could not restore language preference:', error);
  }
});

// Update i18n language when the page props locale changes
document.addEventListener('inertia:success', (event) => {
  const locale = event.detail.page.props.locale;
  if (locale && locale !== i18n.language) {
    i18n.changeLanguage(locale);
  }
});

export default i18n; 