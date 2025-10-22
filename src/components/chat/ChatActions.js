import React from 'react';
import t from '../../locales/i18n';

const ChatActions = ({ 
  hintCount, 
  continueChat, 
  getFullAnswer, 
  isLoading,
  isCoolingDown,
  cooldownRemaining,
  showActions = true  // New prop to control visibility
}) => {
  // Don't show actions if explicitly disabled
  if (!showActions) return null;

  const actionDisabled = isLoading || isCoolingDown;
  const continueLabel = isCoolingDown
    ? t('chat.cooldown.button', { seconds: cooldownRemaining })
    : t('chat.input.continueButton');
  const fullAnswerLabel = isCoolingDown
    ? t('chat.cooldown.button', { seconds: cooldownRemaining })
    : t('chat.input.fullAnswerButton');
  const actionTitle = isCoolingDown
    ? t('chat.cooldown.tooltip', { seconds: cooldownRemaining })
    : undefined;

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Hint counter display - only show if there are actual hints */}
      {hintCount > 0 && (
        <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2">
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
          disabled={actionDisabled}
          title={actionTitle}
          className="w-full py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-2xl sm:rounded-full hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base touch-target"
        >
          {isLoading ? t('chat.actions.thinking') : continueLabel}
        </button>
      )}
      
      {/* Full answer button - show only if hint count >= 4 */}
      {hintCount >= 4 && (
        <button 
          onClick={getFullAnswer} 
          disabled={actionDisabled}
          title={actionTitle}
          className="w-full py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl sm:rounded-full hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base touch-target"
        >
          {isLoading ? t('chat.actions.preparing') : fullAnswerLabel}
        </button>
      )}

      {isCoolingDown && (
        <div className="text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {t('chat.cooldown.actionHelper', { seconds: cooldownRemaining })}
        </div>
      )}
    </div>
  );
};

export default ChatActions; 
