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
    <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-seablue-200 dark:border-gray-700 p-3 sm:p-4 flex items-center justify-between">
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="mr-2 sm:mr-3 p-1.5 sm:p-2 text-seablue-600 dark:text-gray-300 hover:bg-seablue-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
          title={showSidebar ? "Hide sidebar" : "Show sidebar"}
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 sm:gap-2 truncate">
            <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 flex-shrink-0" />
            <span className="truncate">{currentConversationTitle}</span>
          </h1>
          <p className="text-xs sm:text-sm text-seablue-600 dark:text-gray-400 hidden sm:block">{t('chat.subtitle')}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 flex-shrink-0">
        <div className="block">
          <BackgroundSelector 
            onBackgroundChange={onBackgroundChange}
            currentBackground={currentBackground}
          />
        </div>
        <Link 
          to="/leaderboard" 
          className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium flex items-center gap-1"
          title="View Leaderboard"
        >
          <span className="text-sm">🏆</span>
          <span className="hidden sm:inline">{t('leaderboard.title')}</span>
        </Link>
        <Link 
          to="/" 
          className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm bg-seablue-gradient text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium flex items-center gap-1"
          title="Go to Homepage"
        >
          <span className="text-sm">🏠</span>
          <span className="hidden sm:inline">{t('home.home')}</span>
        </Link>
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader; 