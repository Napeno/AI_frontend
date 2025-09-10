import en from './en.json';
import vi from './vi.json';

const resources = {
  en: {
    translation: en
  },
  vi: {
    translation: vi
  }
};

// Get language from localStorage or default to 'en'
const getLanguage = () => {
  const savedLang = localStorage.getItem('language');
  return savedLang && resources[savedLang] ? savedLang : 'vi';
};

// Set language to localStorage
const setLanguage = (lang) => {
  if (resources[lang]) {
    localStorage.setItem('language', lang);
    return true;
  }
  return false;
};

// Get available languages
const getAvailableLanguages = () => {
  return Object.keys(resources).map(lang => ({
    code: lang,
    name: lang === 'en' ? 'English' : 'Tiếng Việt',
    flag: lang === 'en' ? '🇺🇸' : '🇻🇳'
  }));
};

// Translation function
const t = (key, lang = getLanguage()) => {
  const keys = key.split('.');
  let value = resources[lang]?.translation;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // Fallback to English if translation not found
      value = resources.en?.translation;
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey];
        } else {
          return key; // Return key if translation not found
        }
      }
      break;
    }
  }
  
  if (typeof value === 'string') {
    // Handle interpolation for dynamic values like {{days}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, placeholder) => {
      return placeholder;
    });
  }
  
  return value || key;
};

export { resources, getLanguage, setLanguage, getAvailableLanguages, t };
export default t; 