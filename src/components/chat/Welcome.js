import React, { useState } from 'react';
import t from '../../locales/i18n';

const Welcome = ({ onStart }) => {
  const [educationLevel, setEducationLevel] = useState('middle');
  const [subjectArea, setSubjectArea] = useState('natural_sciences');

  const handleStart = () => {
    onStart({ educationLevel, subjectArea });
  };

  return (
    <div className="text-center text-gray-600 my-10 flex flex-col items-center justify-center h-full">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
      <p className="text-lg mb-2 font-bold text-gray-900">{t('newChatModal.title')}</p>
      <p className="text-base mb-4 text-gray-700">{t('newChatModal.description')}</p>
      
      <div className="w-full max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sidebar.educationLevel')}</label>
          <select 
            value={educationLevel} 
            onChange={(e) => setEducationLevel(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="elementary">{t('levels.elementary')}</option>
            <option value="middle">{t('levels.middle')}</option>
            <option value="high">{t('levels.high')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('sidebar.subjectArea')}</label>
          <select 
            value={subjectArea} 
            onChange={(e) => setSubjectArea(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
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
  );
};

export default Welcome; 