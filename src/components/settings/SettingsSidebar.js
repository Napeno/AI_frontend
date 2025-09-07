import React from 'react';
import t from '../../locales/i18n';

const SettingsSidebar = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { key: 'general', label: t('settings.tabs.general') },
    { key: 'account', label: t('settings.tabs.account') },
  ];

  return (
    <div className="w-64 bg-gray-100 p-4 border-r border-gray-200">
      <h2 className="text-lg font-semibold mb-4">{t('userProfile.settings')}</h2>
      <ul>
        {tabs.map(tab => (
          <li key={tab.key}>
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-3 py-2 rounded ${
                activeTab === tab.key ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'
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