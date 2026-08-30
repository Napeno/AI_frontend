import React, { useRef } from 'react';
import t from '../../locales/i18n';

const UserAnswerInput = ({
  userAnswer,
  setUserAnswer,
  checkUserAnswer,
  checkUserAnswerWithImage,
  isLoading,
  handleAnswerKeyPress,
  messages = [],
  problemContext,
  setActiveQuestion,
  title = t('userAnswer.title'),
  description = t('userAnswer.description'),
  placeholder = t('userAnswer.placeholder'),
  buttonLabel = t('userAnswer.checkButton'),
  showProblemContext = true,
  onBack,
}) => {
  const fileInputRef = useRef(null);
  const [selectedAnswerImage, setSelectedAnswerImage] = React.useState(null);

  const handleAnswerImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedAnswerImage(file);
    }
  };

  const handleAnswerImageRemove = () => {
    setSelectedAnswerImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

    if (selectedAnswerImage && checkUserAnswerWithImage) {
      checkUserAnswerWithImage(selectedAnswerImage, userAnswer);
      setSelectedAnswerImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      checkUserAnswer();
    }
  };

  const questions = problemContext?.questions || [];
  const activeQuestion = questions.find(question => question.id === problemContext?.activeQuestionId);
  const suggestedQuestion = questions.find(question => question.id === problemContext?.suggestedQuestionId);
  const questionToShow = activeQuestion || suggestedQuestion;
  const questionName = questionToShow?.id === 'main'
    ? ''
    : `${t('problemContext.question')} ${questionToShow?.id} — `;

  return (
    <div className="check-answer-panel mb-2 sm:mb-3 rounded-2xl border p-2.5 sm:p-3">
      {showProblemContext && questionToShow && (
        <div className="mb-3 rounded-md border border-orange-200 bg-white/80 p-2 dark:border-orange-700 dark:bg-gray-800/70">
          <p className="text-xs font-semibold text-orange-800 dark:text-orange-200">
            {t('problemContext.title')}: {questionName}{questionToShow.sourceExpression || questionToShow.prompt}
          </p>
          {questions.length > 1 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {questions.map(question => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setActiveQuestion?.(question.id)}
                  disabled={isLoading}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${question.id === problemContext?.activeQuestionId ? 'bg-orange-600 text-white' : question.id === problemContext?.suggestedQuestionId ? 'border border-orange-400 bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-100' : 'border border-orange-200 bg-white text-orange-700 dark:border-orange-700 dark:bg-gray-800 dark:text-orange-200'}`}
                >
                  {t('problemContext.question')} {question.id}
                </button>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-orange-600 dark:text-orange-300">
            {activeQuestion ? t('problemContext.autoSelected') : t('problemContext.selectHint', { question: suggestedQuestion?.id })}
          </p>
        </div>
      )}
      <div className="mb-1 flex items-center justify-between gap-2 sm:mb-2">
        <p className="text-xs text-orange-800 dark:text-orange-200 sm:text-sm font-medium">{title}</p>
        {onBack && (
          <button type="button" onClick={onBack} disabled={isLoading} className="rounded-md px-2 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60 dark:text-orange-200 dark:hover:bg-orange-800">
            ← {t('common.back')}
          </button>
        )}
      </div>
      <p className="text-xs text-orange-600 dark:text-orange-300 mb-2">
        {description}
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

      {/* Image preview for answer check */}
      {selectedAnswerImage && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 border border-orange-200 rounded-lg bg-orange-50 dark:bg-orange-800 dark:border-orange-600">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs text-orange-600 dark:text-orange-300 truncate">
              {t('chat.image.selectedForAnswer')}: {selectedAnswerImage.name}
            </span>
            <button
              onClick={handleAnswerImageRemove}
              className="text-red-500 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded touch-target"
            >
              {t('common.remove')}
            </button>
          </div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-orange-100 dark:bg-orange-700 rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(selectedAnswerImage)}
              alt="Answer Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyPress={handleAnswerKeyPress}
            placeholder={selectedAnswerImage ? t('userAnswer.placeholderWithImage') || "Nhập câu trả lời của bạn (có kèm hình ảnh)" : placeholder}
            disabled={isLoading}
            rows="1"
            className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-orange-200 rounded-lg text-sm resize-none outline-none focus:border-orange-500 transition-colors disabled:bg-orange-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-orange-700 dark:text-gray-200 dark:focus:border-orange-500 dark:disabled:bg-gray-700"
          />

          {/* Image upload button for answer */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 text-orange-500 hover:text-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            title={t('userAnswer.addImage') || "Thêm hình ảnh"}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAnswerImageSelect}
            accept="image/*"
            className="hidden"
          />
        </div>
        <button
          onClick={handleAnswerSubmit}
          disabled={isLoading || (!userAnswer.trim() && !selectedAnswerImage)}
          className={`check-answer-button px-3 py-2 sm:px-6 sm:py-3 font-semibold rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm sm:text-base touch-target ${
            hasDuplicateAnswer 
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
              : 'bg-orange-600 hover:bg-orange-700 text-white'
          }`}
          data-coin-source="true"
        >
          {isLoading ? t('userAnswer.checking') : (
            hasDuplicateAnswer ? (t('userAnswer.resubmit') || 'Gửi lại') : buttonLabel
          )}
        </button>
      </div>
    </div>
  );
};

export default UserAnswerInput;
