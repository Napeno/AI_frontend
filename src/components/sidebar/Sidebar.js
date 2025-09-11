import React from 'react';
import t from '../../locales/i18n';
import ConversationItem from './ConversationItem';
import UserProfile from './UserProfile';

const Sidebar = ({ 
  showSidebar, 
  conversations = [],
  sessionId, 
  createNewChat, 
  loadConversation, 
  deleteConversation,
  coinAnimationTrigger,
  pointsAnimationTrigger,
}) => {
  // Ensure conversations is always an array
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  
  return (
          <div className="bg-white dark:bg-gray-800 shadow-xl w-full md:w-80 overflow-hidden flex flex-col h-full border-r border-seablue-200">
      <div className="flex-shrink-0 p-3 sm:p-4 border-b border-seablue-200 dark:border-gray-700 bg-seablue-50 dark:bg-gray-800">
        <button
          onClick={createNewChat}
          className="w-full bg-seablue-gradient text-white font-semibold py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('common.newChat')}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
        {safeConversations.length === 0 && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-6 sm:py-8 px-2">
            <p className="text-xs sm:text-sm">{t('sidebar.empty.title')}</p>
            <p className="text-xs mt-1">{t('sidebar.empty.subtitle')}</p>
          </div>
        )}
        
        {safeConversations.map((conv) => (
          <ConversationItem
            key={conv.sessionId}
            conversation={conv}
            isActive={sessionId === conv.sessionId}
            onSelect={() => loadConversation(conv.sessionId)}
            onDelete={() => deleteConversation(conv.sessionId)}
          />
        ))}
      </div>
      
      <div className="p-3 sm:p-4 border-t border-seablue-200 dark:border-gray-700 bg-seablue-50 dark:bg-gray-800">
        <UserProfile 
          coinAnimationTrigger={coinAnimationTrigger}
          pointsAnimationTrigger={pointsAnimationTrigger}
        />
      </div>
    </div>
  );
};

export default Sidebar; 