import React from 'react';
import { Link } from 'react-router-dom';
import t from '../../locales/i18n';
import LanguageSwitcher from '../LanguageSwitcher';
import BackgroundSelector from '../ui/BackgroundSelector';

const ChatHeader = ({ 
  showSidebar, 
  setShowSidebar, 
  currentConversationTitle,
  onBackgroundChange,
  currentBackground,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-seablue-200 dark:border-gray-700 p-4 flex items-center justify-between">
      <div className="flex items-center">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mr-4 p-2 text-seablue-600 dark:text-gray-300 hover:bg-seablue-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
            🦭 {currentConversationTitle}
          </h1>
          <p className="text-sm text-seablue-600 dark:text-gray-400">{t('chat.subtitle')}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <BackgroundSelector 
          onBackgroundChange={onBackgroundChange}
          currentBackground={currentBackground}
        />
        <Link 
          to="/leaderboard" 
          className="px-3 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium"
          title="View Leaderboard"
        >
          🏆 {t('leaderboard.title')}
        </Link>
        <Link 
          to="/" 
          className="px-3 py-2 text-sm bg-seablue-gradient text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium"
          title="Go to Homepage"
        >
          🏠 {t('home.home')}
        </Link>
        <LanguageSwitcher />
      </div>
    </div>
  );
};

export default ChatHeader; 