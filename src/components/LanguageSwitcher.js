import React, { useState, useEffect } from 'react';
import { getLanguage, setLanguage, getAvailableLanguages } from '../locales/i18n';

const LanguageSwitcher = ({ onLanguageChange }) => {
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [isOpen, setIsOpen] = useState(false);
  const languages = getAvailableLanguages();

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const handleLanguageChange = (langCode) => {
    if (setLanguage(langCode)) {
      setCurrentLang(langCode);
      setIsOpen(false);
      if (onLanguageChange) {
        onLanguageChange(langCode);
      }
      // Reload page to apply new language
      window.location.reload();
    }
  };

  const currentLanguage = languages.find(lang => lang.code === currentLang);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600"
      >
        <span className="text-lg">{currentLanguage?.flag}</span>
        <span>{currentLanguage?.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentLang === language.code ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <span>{language.name}</span>
                {currentLang === language.code && (
                  <svg className="w-4 h-4 ml-auto text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default LanguageSwitcher; 