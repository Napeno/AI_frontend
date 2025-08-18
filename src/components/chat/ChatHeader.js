import React from 'react';
import t from '../../locales/i18n';
import LanguageSwitcher from '../LanguageSwitcher';

const ChatHeader = ({ 
  showSidebar, 
  setShowSidebar, 
  currentConversationTitle, 
  onLanguageChange 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">{currentConversationTitle}</h1>
          <p className="text-sm text-gray-500">{t('chat.subtitle')}</p>
        </div>
      </div>
      
      <LanguageSwitcher onLanguageChange={onLanguageChange} />
    </div>
  );
};

export default ChatHeader; 