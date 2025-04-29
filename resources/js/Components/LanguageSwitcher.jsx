import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { router } from '@inertiajs/react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(i18n.language);
  const [isChanging, setIsChanging] = useState(false);

  // Sync with i18n language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLang(i18n.language);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  // Sync with cookie on mount
  useEffect(() => {
    try {
      const cookies = document.cookie.split(';');
      const localeCookie = cookies.find(cookie => cookie.trim().startsWith('locale='));
      if (localeCookie) {
        const locale = localeCookie.split('=')[1].trim();
        if (locale && locale !== currentLang) {
          setCurrentLang(locale);
          i18n.changeLanguage(locale);
        }
      }
    } catch (error) {
      console.warn('Could not read language from cookie:', error);
    }
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const switchLanguage = async (locale) => {
    if (locale === currentLang || isChanging) {
      setIsOpen(false);
      return;
    }

    setIsChanging(true);

    try {
      // Update the server-side language first
      await router.post(route('language.switch', { locale }), {}, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          // Only update client-side language after server confirms
          i18n.changeLanguage(locale);
          setCurrentLang(locale);
          setIsOpen(false);
        },
        onError: () => {
          console.error('Failed to switch language on server');
        }
      });
    } catch (error) {
      console.error('Error switching language:', error);
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
      >
        <span className="mr-2">{currentLanguage.flag}</span>
        <span>{currentLanguage.name}</span>
        <svg
          className="-me-0.5 ms-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        {isChanging && (
          <svg className="animate-spin ml-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                disabled={isChanging}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  lang.code === currentLang
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } disabled:opacity-50`}
                role="menuitem"
              >
                <div className="flex items-center">
                  <span className="mr-2">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher; 