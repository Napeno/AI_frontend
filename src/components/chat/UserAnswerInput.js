import React from 'react';
import t from '../../locales/i18n';

const UserAnswerInput = ({ 
  userAnswer, 
  setUserAnswer, 
  checkUserAnswer, 
  isLoading, 
  handleAnswerKeyPress,
  messages = []
}) => {
  // Check if user has already given this answer correctly
  const normalizedCurrentAnswer = userAnswer.toLowerCase().trim();
  const hasDuplicateAnswer = normalizedCurrentAnswer && messages.some(msg => {
    if (msg.sender === 'user' && msg.text) {
      const normalizedMsg = msg.text.toLowerCase().trim();
      if (normalizedMsg === normalizedCurrentAnswer) {
        // Check if there's a subsequent correct response
        const msgIndex = messages.findIndex(m => m.id === msg.id);
        if (msgIndex >= 0 && msgIndex < messages.length - 1) {
          const nextMsg = messages[msgIndex + 1];
          return nextMsg && nextMsg.sender === 'bot' && nextMsg.isCorrect === true;
        }
      }
    }
    return false;
  });

  const handleAnswerSubmit = () => {
    if (hasDuplicateAnswer) {
      const confirmed = window.confirm(
        t('userAnswer.duplicateWarning') || 
        'Bạn đã trả lời đúng với câu trả lời này trước đó. Bạn có chắc muốn gửi lại không?'
      );
      if (!confirmed) {
        return;
      }
    }
    checkUserAnswer();
  };

  return (
    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/50 dark:border-blue-700/60">
      <p className="text-xs sm:text-sm text-blue-800 dark:text-blue-200 mb-2 font-medium">
        {t('userAnswer.title')}
      </p>
      <p className="text-xs text-blue-600 dark:text-blue-300 mb-2 sm:mb-3">
        {t('userAnswer.description')}
      </p>
      
      {/* Duplicate Answer Warning */}
      {hasDuplicateAnswer && (
        <div className="mb-2 sm:mb-3 p-2 bg-yellow-100 border border-yellow-300 rounded-md dark:bg-yellow-900/30 dark:border-yellow-700">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-xs text-yellow-800 dark:text-yellow-200">
              {t('userAnswer.duplicateMessage') || 'Bạn đã trả lời đúng câu này trước đó với cùng đáp án.'}
            </span>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleAnswerKeyPress}
          placeholder={t('userAnswer.placeholder')}
          disabled={isLoading}
          rows="2"
          className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-blue-200 rounded-lg text-sm resize-none outline-none focus:border-blue-500 transition-colors disabled:bg-blue-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-blue-700 dark:text-gray-200 dark:focus:border-blue-500 dark:disabled:bg-gray-700"
        />
        <button 
          onClick={handleAnswerSubmit} 
          disabled={isLoading || !userAnswer.trim()}
          className={`check-answer-button px-4 py-2.5 sm:px-6 sm:py-3 font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm sm:text-base touch-target ${
            hasDuplicateAnswer 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          data-coin-source="true"
        >
          {isLoading ? t('userAnswer.checking') : (
            hasDuplicateAnswer ? (t('userAnswer.resubmit') || 'Gửi lại') : t('userAnswer.checkButton')
          )}
        </button>
      </div>
    </div>
  );
};

export default UserAnswerInput; 