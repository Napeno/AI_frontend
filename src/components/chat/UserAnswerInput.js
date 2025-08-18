import React from 'react';
import t from '../../locales/i18n';

const UserAnswerInput = ({ 
  userAnswer, 
  setUserAnswer, 
  checkUserAnswer, 
  isLoading, 
  handleAnswerKeyPress 
}) => {
  return (
    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      <p className="text-sm text-blue-800 mb-2 font-medium">
        {t('userAnswer.title')}
      </p>
      <p className="text-xs text-blue-600 mb-3">
        {t('userAnswer.description')}
      </p>
      <div className="flex gap-3">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyPress={handleAnswerKeyPress}
          placeholder={t('userAnswer.placeholder')}
          disabled={isLoading}
          rows="2"
          className="flex-1 px-4 py-3 border-2 border-blue-200 rounded-lg text-sm resize-none outline-none focus:border-blue-500 transition-colors disabled:bg-blue-100 disabled:cursor-not-allowed"
        />
        <button 
          onClick={checkUserAnswer} 
          disabled={isLoading || !userAnswer.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none whitespace-nowrap"
        >
          {isLoading ? t('userAnswer.checking') : t('userAnswer.checkButton')}
        </button>
      </div>
    </div>
  );
};

export default UserAnswerInput; 