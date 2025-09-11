import React from 'react';
import t from '../../locales/i18n';

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'general', label: t('settings.tabs.general') },
    { key: 'account', label: t('settings.tabs.account') },
  ];

  return (
    <div className="w-full md:w-64 bg-gray-100 dark:bg-gray-900/50 p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 dark:text-gray-200">{t('userProfile.settings')}</h2>
      <ul>
        {tabs.map(tab => (
          <li key={tab.key}>
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === tab.key ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SettingsSidebar; 