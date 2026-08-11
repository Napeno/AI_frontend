import React from 'react';
import t from '../../locales/i18n';
import ConversationItem from './ConversationItem';

const Sidebar = ({ 
  conversations = [],
  sessionId, 
  createNewChat, 
  loadConversation, 
  deleteConversation,
  onClose,
}) => {
  // Ensure conversations is always an array
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  
  return (
    <div className="flex h-full w-72 flex-col overflow-hidden bg-white shadow-2xl dark:bg-slate-950">
      <div className="flex items-center gap-2 border-b border-slate-200 p-3 dark:border-slate-800">
        <button
          onClick={createNewChat}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-700"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('common.newChat')}
        </button>
        <button type="button" onClick={onClose} aria-label="Đóng lịch sử" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        {safeConversations.length === 0 && (
          <div className="px-3 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            <p>{t('sidebar.empty.title')}</p>
          </div>
        )}
        
        {safeConversations.map((conv) => (
          <ConversationItem
            key={conv.sessionId}
            conversation={conv}
            isActive={sessionId === conv.sessionId}
            onSelect={() => { loadConversation(conv.sessionId); onClose(); }}
            onDelete={() => deleteConversation(conv.sessionId)}
          />
        ))}
      </div>
      
    </div>
  );
};

export default Sidebar; 
