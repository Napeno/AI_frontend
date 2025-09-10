import React, { useState } from 'react';
import t from '../../locales/i18n';

const Welcome = ({ onStart }) => {
  const [educationLevel, setEducationLevel] = useState('middle');
  const [subjectArea, setSubjectArea] = useState('natural_sciences');

  const handleStart = () => {
    onStart({ educationLevel, subjectArea });
  };

  return (
    <div className="text-center text-gray-600 dark:text-gray-400 flex flex-col items-center justify-center h-full relative">
      {/* Background overlay for better text visibility */}
      <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-lg"></div>
      
      {/* Content with higher z-index */}
      <div className="relative z-10 p-8">
        <div className="mb-6">
          <img src="/image/seal-new-chat.png" alt="seal" className="w-40 h-54 flex items-center justify-center mx-auto mb-4" />
        </div>
        <p className="text-lg mb-2 font-bold text-gray-900 dark:text-gray-200">{t('newChatModal.title')}</p>
        <p className="text-base mb-4 text-gray-700 dark:text-gray-300">{t('newChatModal.description')}</p>
        
        <div className="w-full max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebar.educationLevel')}</label>
          <select 
            value={educationLevel} 
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="elementary">{t('levels.elementary')}</option>
            <option value="middle">{t('levels.middle')}</option>
            <option value="high">{t('levels.high')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('sidebar.subjectArea')}</label>
          <select 
            value={subjectArea} 
            onChange={(e) => setSubjectArea(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          >
            <option value="natural_sciences">{t('subjects.naturalSciences')}</option>
            <option value="social_sciences">{t('subjects.socialSciences')}</option>
          </select>
        </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleStart}
            className="bg-indigo-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-indigo-700"
          >
            {t('newChatModal.start')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 