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

// Get initial language from localStorage or default to 'en'
let initialLanguage = 'en';
try {
  const storedLanguage = localStorage.getItem('i18nextLng');
  const htmlLang = document.documentElement.lang;
  initialLanguage = storedLanguage || htmlLang || 'en';
} catch (error) {
  console.warn('Could not access localStorage:', error);
}

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'htmlTag', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    react: {
      useSuspense: false
    }
  });

// Listen for language changes and sync with localStorage and HTML lang
i18n.on('languageChanged', (lng) => {
  try {
    localStorage.setItem('i18nextLng', lng);
    document.documentElement.lang = lng;
  } catch (error) {
    console.warn('Could not save language preference:', error);
  }
});

// Handle Inertia page visits
document.addEventListener('inertia:before', (event) => {
  try {
    const locale = localStorage.getItem('i18nextLng');
    if (locale && locale !== i18n.language) {
      i18n.changeLanguage(locale);
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