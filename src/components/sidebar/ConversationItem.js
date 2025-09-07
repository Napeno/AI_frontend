import React from 'react';
import t from '../../locales/i18n';

const ConversationItem = ({ conversation, isActive, onSelect, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return t('conversation.time.today');
    if (diffDays === 2) return t('conversation.time.yesterday');
    if (diffDays <= 7) return t('conversation.time.daysAgo').replace('{{days}}', diffDays - 1);
    return date.toLocaleDateString();
  };

  const getConversationTitle = (conversation) => {
    // Try to get the first user message as title
    const firstUserMessage = conversation.history?.find(msg => msg.role === 'user');
    if (firstUserMessage) {
      const text = firstUserMessage.parts[0].text;
      // Filter out internal prompts
      if (text.includes('Bạn là một người thầy') || 
          text.includes('Học sinh đang gặp khó khăn') ||
          text.includes('QUAN TRỌNG: Bạn KHÔNG BAO GIỜ') ||
          text.includes('QUY TẮC: Chỉ gợi ý') ||
          text.includes('Student is having difficulty')) {
        return t('sidebar.conversation.newChat');
      }
      return text.length > 30 ? text.substring(0, 30) + '...' : text;
    }
    return t('sidebar.conversation.newChat');
  };

  return (
    <div
      className={`p-3 rounded-lg mb-2 cursor-pointer transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 border ${
        isActive 
          ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-300 dark:border-indigo-700 shadow-sm' 
          : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate mb-1">
            {getConversationTitle(conversation)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(conversation.updatedAt)}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-gray-400 hover:text-red-500 text-sm p-1 hover:bg-red-50 dark:hover:bg-gray-600 rounded transition-colors"
          title={t('common.delete')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationItem; 