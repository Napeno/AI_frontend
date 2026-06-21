import React, { useState } from 'react';
import t from '../../locales/i18n';

const InterventionGate = ({ intervention, isLoading, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [reflection, setReflection] = useState('');

  if (!intervention?.active) {
    return null;
  }

  const miniQuiz = intervention.miniQuiz;
  const quizOptions = Array.isArray(miniQuiz?.options) ? miniQuiz.options : [];
  const reflectionText = reflection.trim();
  const canSubmit = !isLoading && (reflectionText.length >= 2 || selectedOption);
  const isFullAnswerGate = intervention.type === 'full_answer_gate';
  const title = isFullAnswerGate
    ? t('interventionGate.fullAnswerTitle')
    : t('interventionGate.title');

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (reflectionText.length >= 2) {
      onSubmit({ type: 'reflection', value: reflectionText });
    } else {
      onSubmit({ type: 'quiz_choice', value: selectedOption });
    }

    setSelectedOption('');
    setReflection('');
  };

  return (
    <div className="mb-2 sm:mb-3 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/30 dark:border-amber-700/60">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-200">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm sm:text-base font-semibold text-amber-900 dark:text-amber-100">
            {title}
          </p>
          <p className="mt-1 text-xs sm:text-sm text-amber-800 dark:text-amber-200">
            {miniQuiz?.question ? t('interventionGate.quizDescription') : t('interventionGate.description')}
          </p>

          {miniQuiz?.question && (
            <div className="mt-3 p-3 bg-white border border-amber-200 rounded-lg dark:bg-gray-800 dark:border-amber-700">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {miniQuiz.question}
              </p>
            </div>
          )}

          {quizOptions.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quizOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg border text-left text-xs sm:text-sm transition-colors ${
                    selectedOption === option.id
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100 dark:bg-gray-800 dark:border-amber-700 dark:text-amber-100 dark:hover:bg-amber-900/50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className="font-semibold mr-1">{option.id}.</span>
                  {option.text}
                </button>
              ))}
            </div>
          )}

          <textarea
            value={reflection}
            onChange={(event) => setReflection(event.target.value)}
            disabled={isLoading}
            rows="2"
            placeholder={t('interventionGate.placeholder')}
            className="mt-3 w-full px-3 py-2 border border-amber-200 rounded-lg text-sm resize-none outline-none focus:border-amber-500 dark:bg-gray-800 dark:border-amber-700 dark:text-gray-100 dark:focus:border-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? t('interventionGate.submitting') : t('interventionGate.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterventionGate;
