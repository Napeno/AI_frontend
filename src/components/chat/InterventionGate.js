import React, { useEffect, useState } from 'react';
import t from '../../locales/i18n';
import { formatAIMessage } from '../../utils/chatUtils';

const InterventionGate = ({ intervention, isLoading, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState('');
  const [reflection, setReflection] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive = intervention?.active;
  const isChoiceGate = intervention?.requiredAction === 'choose_blocker';
  const blockerOptions = Array.isArray(intervention?.options) ? intervention.options : [];
  const showBlockerChoices = blockerOptions.length > 0 && (
    isChoiceGate || (!isActive && intervention?.canRequestHint)
  );

  useEffect(() => {
    setIsExpanded(isActive);
  }, [isActive, intervention?.type]);

  if (!isActive && !showBlockerChoices) {
    return null;
  }

  const miniQuiz = intervention.miniQuiz;
  const quizOptions = Array.isArray(miniQuiz?.options) ? miniQuiz.options : [];
  const reflectionText = reflection.trim();
  const canSubmit = isActive && !isChoiceGate && !isLoading && (reflectionText.length >= 2 || selectedOption);
  const isFullAnswerGate = intervention.type === 'full_answer_gate';
  const title = isActive
    ? (isFullAnswerGate ? t('interventionGate.fullAnswerTitle') : t('interventionGate.title'))
    : t('interventionGate.supportTitle');
  const description = isChoiceGate
    ? t('interventionGate.choiceGateDescription')
    : miniQuiz?.question
      ? t('interventionGate.quizDescription')
      : isActive
        ? t('interventionGate.description')
        : t('interventionGate.supportDescription');
  const progress = intervention.progress || {};
  const progressSteps = [
    { complete: progress.identifiedBlocker, label: t('interventionGate.progressBlocker') },
    { complete: progress.attempted, label: t('interventionGate.progressAttempt') },
    { complete: progress.revised, label: t('interventionGate.progressRevision') },
  ];

  const handleSubmit = () => {
    if (!canSubmit) return;

    onSubmit(reflectionText.length >= 2
      ? { type: 'reflection', value: reflectionText }
      : { type: 'quiz_choice', value: selectedOption });
    setSelectedOption('');
    setReflection('');
  };

  return (
    <div className="mb-2 sm:mb-3 p-3 sm:p-4 bg-cyan-50 border border-cyan-200 rounded-lg dark:bg-cyan-950/40 dark:border-cyan-800/60">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-100 dark:bg-cyan-900 flex items-center justify-center text-cyan-700 dark:text-cyan-200">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          {isActive ? (
            <>
              <p className="text-sm sm:text-base font-semibold text-cyan-950 dark:text-cyan-100">{title}</p>
              <p className="mt-1 text-xs sm:text-sm text-cyan-800 dark:text-cyan-200">{description}</p>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsExpanded(expanded => !expanded)}
              className="flex w-full items-center justify-between gap-3 text-left"
              aria-expanded={isExpanded}
            >
              <span>
                <span className="block text-sm sm:text-base font-semibold text-cyan-950 dark:text-cyan-100">{title}</span>
                <span className="mt-0.5 block text-xs text-cyan-700 dark:text-cyan-300">Chọn chỗ đang kẹt (tùy chọn)</span>
              </span>
              <svg className={`h-5 w-5 flex-shrink-0 text-cyan-700 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
              </svg>
            </button>
          )}

          {(isActive || isExpanded) && <div className="mt-3">
            {!isActive && <p className="text-xs sm:text-sm text-cyan-800 dark:text-cyan-200">{description}</p>}
            <div className="mt-3 grid grid-cols-3 gap-2">
            {progressSteps.map((step, index) => (
              <div key={step.label} className={`rounded-lg px-2 py-1.5 text-center text-xs ${
                step.complete
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white text-cyan-800 border border-cyan-200 dark:bg-gray-800 dark:text-cyan-200 dark:border-cyan-800'
              }`}>
                <span className="block font-semibold">{step.complete ? '✓' : index + 1}</span>
                <span>{step.label}</span>
              </div>
            ))}
          </div>

          {showBlockerChoices && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {blockerOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => onSubmit({ type: 'blocker_choice', value: option.id })}
                  disabled={isLoading}
                  className="px-3 py-2 rounded-lg border border-cyan-200 bg-white text-left text-xs sm:text-sm text-cyan-950 hover:bg-cyan-100 transition-colors dark:bg-gray-800 dark:border-cyan-800 dark:text-cyan-100 dark:hover:bg-cyan-900/50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          {isActive && !isChoiceGate && miniQuiz?.question && (
            <div className="mt-3 p-3 bg-white border border-cyan-200 rounded-lg dark:bg-gray-800 dark:border-cyan-800">
              <p
                className="text-sm font-semibold text-gray-900 dark:text-gray-100"
                dangerouslySetInnerHTML={{ __html: formatAIMessage(miniQuiz.question) }}
              />
            </div>
          )}

          {isActive && !isChoiceGate && quizOptions.length > 0 && (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {quizOptions.map(option => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  disabled={isLoading}
                  className={`px-3 py-2 rounded-lg border text-left text-xs sm:text-sm transition-colors ${
                    selectedOption === option.id
                      ? 'bg-cyan-600 border-cyan-600 text-white'
                      : 'bg-white border-cyan-200 text-cyan-950 hover:bg-cyan-100 dark:bg-gray-800 dark:border-cyan-800 dark:text-cyan-100 dark:hover:bg-cyan-900/50'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  <span className="font-semibold mr-1">{option.id}.</span>
                  <span dangerouslySetInnerHTML={{ __html: formatAIMessage(option.text) }} />
                </button>
              ))}
            </div>
          )}

          {isActive && !isChoiceGate && (
            <>
              <textarea
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
                disabled={isLoading}
                rows="2"
                placeholder={t('interventionGate.placeholder')}
                className="mt-3 w-full px-3 py-2 border border-cyan-200 rounded-lg text-sm resize-none outline-none focus:border-cyan-500 dark:bg-gray-800 dark:border-cyan-800 dark:text-gray-100 dark:focus:border-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? t('interventionGate.submitting') : t('interventionGate.submit')}
                </button>
              </div>
            </>
          )}
          </div>}
        </div>
      </div>
    </div>
  );
};

export default InterventionGate;
