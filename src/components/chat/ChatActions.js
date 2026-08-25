import React from 'react';
import t from '../../locales/i18n';

const ChatActions = ({ 
  hintCount, 
  continueChat, 
  getFullAnswer, 
  isLoading,
  isCoolingDown,
  cooldownRemaining,
  intervention,
  showActions = true,
  showHint = true,
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
  const canRequestHint = !intervention?.active && intervention?.canRequestHint !== false;
  const fullAnswerRequirements = intervention?.fullAnswerRequirements;
  const showFullAnswer = !intervention?.active && fullAnswerRequirements?.hintsUsed >= fullAnswerRequirements?.hintsRequired;
  const fullAnswerLocked = showFullAnswer && intervention?.canRequestFullAnswer !== true;

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
      {showHint && canRequestHint && (
        <button 
          onClick={continueChat} 
          disabled={actionDisabled}
          title={actionTitle}
          className="chat-action chat-action-hint w-full rounded-2xl py-2.5 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none sm:rounded-full sm:py-3"
        >
          {isLoading ? t('chat.actions.thinking') : continueLabel}
        </button>
      )}
      
      {showFullAnswer && (
        <>
          <button
            onClick={getFullAnswer}
            disabled={actionDisabled}
            title={fullAnswerLocked ? t('chat.actions.fullAnswerLocked') : actionTitle}
            className="chat-action chat-action-answer w-full rounded-2xl py-2.5 font-semibold transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none sm:rounded-full sm:py-3"
          >
            {isLoading ? t('chat.actions.preparing') : fullAnswerLabel}
          </button>
          {fullAnswerLocked && (
            <p className="px-2 text-center text-xs sm:text-sm text-orange-700 dark:text-orange-300">
              {t('chat.actions.fullAnswerLocked')}
            </p>
          )}
        </>
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
