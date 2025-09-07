import React from 'react';
import t from '../../locales/i18n';
import LanguageSwitcher from '../LanguageSwitcher';

const ChatHeader = ({ 
  showSidebar, 
  setShowSidebar, 
  currentConversationTitle, 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mr-4 p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{currentConversationTitle}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('chat.subtitle')}</p>
        </div>
      </div>
      
      <LanguageSwitcher />
    </div>
  );
};

export default ChatHeader; 