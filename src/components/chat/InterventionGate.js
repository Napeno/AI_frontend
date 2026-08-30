import React, { useEffect, useState } from 'react';
import t from '../../locales/i18n';
import { formatAIMessage } from '../../utils/chatUtils';

const InterventionGate = ({ intervention, isLoading, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [reflection, setReflection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = intervention?.active;
  const isChoiceGate = intervention?.requiredAction === 'choose_blocker' && !intervention?.miniQuiz?.question;
  const options = Array.isArray(intervention?.options) ? intervention.options : [];

  useEffect(() => {
    setIsExpanded(Boolean(isActive));
  }, [isActive, intervention?.type]);

  if (!isActive) {
    if (!options.length) return null;

    return (
      <div className="intervention-support rounded-2xl border p-3">
        <button
          type="button"
          onClick={() => setIsExpanded(expanded => !expanded)}
          className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
          aria-expanded={isExpanded}
        >
          <span>
            <span className="block text-sm font-semibold">{t('interventionGate.supportTitle')}</span>
            <span className="mt-0.5 block text-xs">{t('interventionGate.supportDescription')}</span>
          </span>
          <svg className={`h-5 w-5 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-1 gap-2 border-t px-0 pt-3 sm:grid-cols-2">
            {options.map(option => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onSubmit({ type: 'support_choice', value: option.id });
                }}
                disabled={isLoading}
                className="intervention-support-option rounded-xl border px-3 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60"
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
    <div className={`intervention-${isChoiceGate ? 'support' : 'quiz'} rounded-2xl border p-3`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs">{description}</p>

      {isChoiceGate && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => onSubmit({ type: 'blocker_choice', value: option.id })}
              disabled={isLoading}
              className="intervention-support-option rounded-xl border px-3 py-2 text-left text-sm hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {!isChoiceGate && miniQuiz?.question && (
        <div className="intervention-quiz-question mt-3 rounded-xl border p-3 text-sm font-semibold" dangerouslySetInnerHTML={{ __html: formatAIMessage(miniQuiz.question) }} />
      )}

      {!isChoiceGate && quizOptions.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {quizOptions.map(option => (
          <button
              key={option.id}
              type="button"
              onClick={() => setSelectedOption(option.id)}
              disabled={isLoading}
            className={`intervention-quiz-option rounded-xl border px-3 py-2 text-left text-sm transition-colors ${selectedOption === option.id ? 'is-selected' : ''} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span className="mr-1 font-semibold">{option.id}.</span>
              <span dangerouslySetInnerHTML={{ __html: formatAIMessage(option.text) }} />
            </button>
          ))}
        </div>
      )}

      {!isChoiceGate && (
        <>
          <textarea value={reflection} onChange={event => setReflection(event.target.value)} disabled={isLoading} rows="2" placeholder={t('interventionGate.placeholder')} className="intervention-quiz-input mt-3 w-full resize-none rounded-xl border px-3 py-2 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60" />
          <div className="mt-3 flex justify-end">
            <button type="button" onClick={handleSubmit} disabled={!canSubmit} className="intervention-quiz-submit rounded-xl px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? t('interventionGate.submitting') : t('interventionGate.submit')}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InterventionGate;
