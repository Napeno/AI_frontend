import React from 'react';
import t from '../../locales/i18n';

const GeneralSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">{t('settings.tabs.general')}</h2>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <label className="text-gray-700">{t('settings.general.theme')}</label>
          <select className="border rounded px-2 py-1">
            <option>{t('settings.general.system')}</option>
            <option>{t('settings.general.light')}</option>
            <option>{t('settings.general.dark')}</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-gray-700">{t('settings.general.language')}</label>
          <select className="border rounded px-2 py-1">
            <option>English</option>
            <option>Tiếng Việt</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings; 