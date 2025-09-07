import React from 'react';
import t from '../../locales/i18n';
import { useTheme } from '../../context/ThemeContext';

const GeneralSettings = () => {
  const { theme, changeTheme } = useTheme();

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">{t('settings.tabs.general')}</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">{t('settings.general.theme')}</label>
          <select
            value={theme}
            onChange={(e) => changeTheme(e.target.value)}
            className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
          >
            <option value="system">{t('settings.general.system')}</option>
            <option value="light">{t('settings.general.light')}</option>
            <option value="dark">{t('settings.general.dark')}</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700 dark:text-gray-300">{t('settings.general.language')}</label>
          <select className="border rounded px-2 py-1 bg-white dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
            <option>English</option>
            <option>Tiếng Việt</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings; 