import React from 'react';
import t from '../../locales/i18n';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../locales/LanguageContext';
import CustomDropdown from '../ui/CustomDropdown';

const GeneralSettings = () => {
  const { theme, changeTheme } = useTheme();
  const { currentLang, languages, changeLanguage } = useLanguage();

  const themeOptions = [
    { value: 'system', label: t('settings.general.system') },
    { value: 'light', label: t('settings.general.light') },
    { value: 'dark', label: t('settings.general.dark') },
  ];

  const languageOptions = languages.map(lang => ({
    value: lang.code,
    label: lang.name,
  }));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">{t('settings.tabs.general')}</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">{t('settings.general.theme')}</label>
          <CustomDropdown
            options={themeOptions}
            selected={theme}
            onChange={changeTheme}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">{t('settings.general.language')}</label>
          <CustomDropdown
            options={languageOptions}
            selected={currentLang}
            onChange={changeLanguage}
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings; 