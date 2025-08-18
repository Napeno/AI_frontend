import React from 'react';
import t from '../../locales/i18n';
import ConversationItem from './ConversationItem';

const Sidebar = ({ 
  showSidebar, 
  conversations, 
  sessionId, 
  createNewChat, 
  loadConversation, 
  deleteConversation 
}) => {
  return (
    <div className={`bg-white shadow-xl transition-all duration-300 ${showSidebar ? 'w-80' : 'w-0'} overflow-hidden`}>
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={createNewChat}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('common.newChat')}
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">{t('sidebar.empty.title')}</p>
            <p className="text-xs mt-1">{t('sidebar.empty.subtitle')}</p>
          </div>
        )}
        
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.sessionId}
            conversation={conv}
            isActive={sessionId === conv.sessionId}
            onSelect={() => loadConversation(conv.sessionId)}
            onDelete={() => deleteConversation(conv.sessionId)}
          />
        ))}
      </div>
    </div>
  );
};

export default Sidebar; 