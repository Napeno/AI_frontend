import React from 'react';
import t from '../../locales/i18n';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  sendMessage, 
  isLoading, 
  handleKeyPress 
}) => {
  return (
    <div className="flex gap-3 mb-4">
      <textarea
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={t('chat.input.placeholder')}
        disabled={isLoading}
        rows="1"
        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full text-sm resize-none outline-none focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      <button 
        onClick={sendMessage} 
        disabled={isLoading || !inputMessage.trim()}
        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {t('common.send')}
      </button>
    </div>
  );
};

export default ChatInput; 