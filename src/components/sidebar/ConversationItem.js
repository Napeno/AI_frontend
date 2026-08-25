import React from 'react';
import t from '../../locales/i18n';

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
  return (
    <div
      className={`group mb-1 cursor-pointer rounded-lg px-3 py-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${
        isActive 
          ? 'bg-orange-50 text-orange-950 dark:bg-orange-950/40 dark:text-orange-100' 
          : 'text-slate-800 dark:text-slate-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-medium">
            {conversation.title || t('sidebar.conversation.newChat')}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`${t('common.delete')}: ${conversation.title || t('sidebar.conversation.newChat')}`}
          className="rounded p-1 text-slate-400 opacity-100 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 sm:opacity-0 sm:group-hover:opacity-100"
          title={t('common.delete')}
        >
          <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationItem; 
