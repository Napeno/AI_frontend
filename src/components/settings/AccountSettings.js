import React from 'react';
import t from '../../locales/i18n';

const AccountSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 dark:text-gray-200">{t('settings.tabs.account')}</h2>
      <div className="space-y-6">
        <div className="border p-4 rounded dark:border-gray-700">
          <label className="block font-medium dark:text-gray-200">{t('settings.account.deleteAccount')}</label>
          <div className="flex items-center justify-between mt-2">
            <p className="text-gray-600 dark:text-gray-400">{t('settings.account.deleteWarning')}</p>
            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
              {t('common.delete')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings; 