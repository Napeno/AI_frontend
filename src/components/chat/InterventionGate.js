import React, { useEffect, useState } from 'react';
import t from '../../locales/i18n';
import { formatAIMessage } from '../../utils/chatUtils';

const InterventionGate = ({ intervention, isLoading, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [reflection, setReflection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = intervention?.active;
  const isChoiceGate = intervention?.requiredAction === 'choose_blocker';
  const options = Array.isArray(intervention?.options) ? intervention.options : [];

  useEffect(() => {
    setIsExpanded(Boolean(isActive));
  }, [isActive, intervention?.type]);

  if (!isActive) {
    if (!options.length) return null;

    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-800/60 dark:bg-orange-950/40">
        <button
          type="button"
          onClick={() => setIsExpanded(expanded => !expanded)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
          aria-expanded={isExpanded}
        >
          <span>
            <span className="block text-sm font-semibold text-orange-950 dark:text-orange-100">{t('interventionGate.supportTitle')}</span>
            <span className="mt-0.5 block text-xs text-orange-700 dark:text-orange-300">{t('interventionGate.supportDescription')}</span>
          </span>
          <svg className={`h-5 w-5 flex-shrink-0 text-orange-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 gap-2 border-t border-orange-200 px-3 py-3 sm:grid-cols-2 dark:border-orange-800/60">
            {options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onSubmit({ type: 'support_choice', value: option.id });
                }}
                disabled={isLoading}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-left text-sm text-orange-950 transition-colors hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-800 dark:bg-gray-800 dark:text-orange-100 dark:hover:bg-orange-900/50"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const miniQuiz = intervention.miniQuiz;
  const quizOptions = Array.isArray(miniQuiz?.options) ? miniQuiz.options : [];
  const reflectionText = reflection.trim();
  const canSubmit = !isChoiceGate && !isLoading && (reflectionText.length >= 2 || selectedOption);
  const title = intervention.type === 'full_answer_gate'
    ? t('interventionGate.fullAnswerTitle')
    : t('interventionGate.title');
  const description = isChoiceGate
    ? t('interventionGate.choiceGateDescription')
    : miniQuiz?.question
      ? t('interventionGate.quizDescription')
      : t('interventionGate.description');

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(reflectionText.length >= 2
      ? { type: intervention.type === 'full_answer_gate' ? 'alternate_view' : 'reflection', value: reflectionText }
      : { type: 'quiz_choice', value: selectedOption });
    setSelectedOption('');
    setReflection('');
  };

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800/60 dark:bg-orange-950/40">
      <p className="text-sm font-semibold text-orange-950 dark:text-orange-100">{title}</p>
      <p className="mt-1 text-xs text-orange-800 dark:text-orange-200">{description}</p>

      {isChoiceGate && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSubmit({ type: 'blocker_choice', value: option.id })}
              disabled={isLoading}
              className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-left text-sm text-orange-950 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-800 dark:bg-gray-800 dark:text-orange-100 dark:hover:bg-orange-900/50"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {!isChoiceGate && miniQuiz?.question && (
        <div className="mt-3 rounded-lg border border-orange-200 bg-white p-3 text-sm font-semibold text-gray-900 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100" dangerouslySetInnerHTML={{ __html: formatAIMessage(miniQuiz.question) }} />
      )}

      {!isChoiceGate && quizOptions.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quizOptions.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              disabled={isLoading}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${selectedOption === option.id ? 'border-orange-600 bg-orange-600 text-white' : 'border-orange-200 bg-white text-orange-950 hover:bg-orange-100 dark:border-orange-800 dark:bg-gray-800 dark:text-orange-100 dark:hover:bg-orange-900/50'} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="mr-1 font-semibold">{option.id}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatAIMessage(option.text) }} />
            </button>
          ))}
        </div>
      )}

      {!isChoiceGate && (
        <>
          <textarea value={reflection} onChange={event => setReflection(event.target.value)} disabled={isLoading} rows="2" placeholder={t('interventionGate.placeholder')} className="mt-3 w-full resize-none rounded-lg border border-orange-200 px-3 py-2 text-sm outline-none focus:border-orange-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-orange-800 dark:bg-gray-800 dark:text-gray-100" />
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? t('interventionGate.submitting') : t('interventionGate.submit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InterventionGate;
