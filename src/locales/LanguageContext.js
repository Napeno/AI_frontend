import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage, getAvailableLanguages } from './i18n';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const languages = getAvailableLanguages();

  const changeLanguage = (langCode) => {
    if (setLanguage(langCode)) {
      setCurrentLang(langCode);
      window.location.reload();
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, languages, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext); 