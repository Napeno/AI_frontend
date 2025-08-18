import React from 'react';
import t from '../../locales/i18n';

const ChatActions = ({ 
  messages, 
  hintCount, 
  continueChat, 
  getFullAnswer, 
  isLoading 
}) => {
  if (messages.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Hint counter display - only show if there are actual hints */}
      {hintCount > 0 && (
        <div className="text-center text-sm text-gray-600">
          {hintCount === 1 && t('chat.hintCounter.one')}
          {hintCount === 2 && t('chat.hintCounter.two')}
          {hintCount === 3 && t('chat.hintCounter.three')}
          {hintCount >= 4 && t('chat.hintCounter.four')}
        </div>
      )}
      
      {/* Continue button - show only if hint count < 4 */}
      {hintCount < 4 && (
        <button 
          onClick={continueChat} 
          disabled={isLoading}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-full hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? t('chat.actions.thinking') : t('chat.input.continueButton')}
        </button>
      )}
      
      {/* Full answer button - show only if hint count >= 4 */}
      {hintCount >= 4 && (
        <button 
          onClick={getFullAnswer} 
          disabled={isLoading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? t('chat.actions.preparing') : t('chat.input.fullAnswerButton')}
        </button>
      )}
    </div>
  );
};

export default ChatActions; 