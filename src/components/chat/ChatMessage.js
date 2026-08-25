import React, { useState } from 'react';
import { post } from '../../utils/apiClient';

function ChatMessage({ message, formatAIMessage, userAvatar, sessionId }) {
  const [isReporting, setIsReporting] = useState(false);
  const [correction, setCorrection] = useState('');
  const [reportState, setReportState] = useState('idle');

  const isUser = message.sender === 'user';
  const isError = message.isError;
  const isContinue = message.sender === 'continue';
  const isFullAnswer = message.sender === 'full-answer';
  const isCheckAnswer = message.sender === 'check-answer';
  const isCoinAward = message.sender === 'system' && message.type === 'chestnut-award';
  const isSystemAction = isContinue || isFullAnswer || isCheckAnswer || isCoinAward;

  const messageContent = message.text || '';
  const hasImage = message.imageUrl || message.image;

  const reportError = async () => {
    if (correction.trim().length < 12) return;
    setReportState('loading');
    try {
      const response = await post('/user/ai-error', { sessionId, messageText: messageContent, correction: correction.trim(), language: 'vi' });
      const data = await response.json();
      setReportState(response.ok && data.valid ? 'done' : 'invalid');
    } catch {
      setReportState('error');
    }
  };


  const formattedContent = isUser || isError || isSystemAction
    ? messageContent
    : formatAIMessage(messageContent);


  // Different styling for system actions (continue, full-answer, check-answer)
  if (isSystemAction) {
    let bgColor, borderColor, textColor, icon;
    
    if (isContinue) {
      bgColor = 'bg-yellow-50 dark:bg-yellow-900/50';
      borderColor = 'border-yellow-300 dark:border-yellow-700/50';
      textColor = 'text-yellow-700 dark:text-yellow-300';
      icon = '💭';
    } else if (isFullAnswer) {
      bgColor = 'bg-purple-50 dark:bg-purple-900/50';
      borderColor = 'border-purple-300 dark:border-purple-700/50';
      textColor = 'text-purple-700 dark:text-purple-300';
      icon = '📖';
    } else if (isCheckAnswer) {
      bgColor = 'bg-green-50 dark:bg-green-900/50';
      borderColor = 'border-green-300 dark:border-green-700/50';
      textColor = 'text-green-700 dark:text-green-300';
    } else if (isCoinAward) {
      bgColor = 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/30';
      borderColor = 'border-yellow-300 dark:border-yellow-700/50';
      textColor = 'text-yellow-800 dark:text-yellow-300';
      icon = '🪙';
    }
    
    return (
      <div className="flex justify-center mb-4 sm:mb-5 px-2">
        <div className={`chat-system-message max-w-[90%] rounded-2xl px-3 py-2 shadow-sm sm:max-w-[80%] sm:px-5 sm:py-3 sm:rounded-full border-2 border-dashed ${bgColor} ${borderColor} ${textColor}`}>
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {isCoinAward && (
              <div className="text-lg sm:text-xl">
                {icon}
              </div>
            )}
            <span className="text-sm sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2">
              {!isCoinAward &&(
                <>
                 {isContinue &&(
                  <img
                    src="/gif/loading.gif"
                    alt="loading"
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 inline-block align-middle"
                  />
                )}
                {(isCheckAnswer || isFullAnswer) &&(
                  <img
                    src="/gif/thinking.gif"
                    alt="thinking"
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 inline-block align-middle"
                  />
                )}
                </>
              )}
              <span className="text-center">{formattedContent}</span>
            </span>
          </div>
          {message.timestamp && (
            <span className="block text-xs text-center mt-1 opacity-60">
              {message.timestamp}
            </span>
          )}
        </div>
      </div>
    );
  }

  const isCorrect = message.isCorrect === true;
  const isIncorrect = message.isCorrect === false;
  const isUncertain = message.evaluationStatus === 'uncertain';

  let containerClasses = "chat-bubble max-w-[75%] rounded-2xl px-3 py-3 shadow-md sm:max-w-[80%] sm:px-5 sm:py-4";
  if (isUser) {
    containerClasses += " chat-bubble-user rounded-br-md";
  } else if (isError) {
    containerClasses += " chat-bubble-ai rounded-bl-md";
  } else if (isCorrect) {
    containerClasses += " chat-bubble-success rounded-bl-md";
  } else if (isIncorrect) {
    containerClasses += " chat-bubble-error rounded-bl-md";
  } else if (isUncertain) {
    containerClasses += " chat-bubble-warn rounded-bl-md";
  } else {
    containerClasses += " chat-bubble-ai rounded-bl-md";
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4 px-2`}>
      {/* Add avatar for AI messages */}
      {!isUser && (
        <div className="squirrel-avatar mr-1.5 sm:mr-3 flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8">
          <img src="/image/squirrel-mascot.svg" alt="ThinkBridge mascot" className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      )}
      <div className={containerClasses}>
        {isIncorrect && (
          <div className="flex items-center mb-2 font-bold text-red-600 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1.5 sm:mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm lg:text-base">Câu trả lời chưa chính xác</span>
          </div>
        )}
        {isCorrect && (
          <div className="flex items-center mb-2 font-bold text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 mr-1.5 sm:mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm lg:text-base">Câu trả lời chính xác!</span>
          </div>
        )}
        {isUncertain && (
          <div className="flex items-center mb-2 font-bold text-orange-700 dark:text-orange-300">
            <span className="mr-1.5 text-base">💬</span>
            <span className="text-xs sm:text-sm lg:text-base">Cần làm rõ</span>
          </div>
        )}

        {/* Centered status image for correct/incorrect */}
        {(isCorrect || isIncorrect) && (
          <div className="flex justify-center my-2 sm:my-3">
        <span 
              role="img"
              aria-label={isCorrect ? 'correct' : 'incorrect'}
              className="text-4xl sm:text-5xl lg:text-6xl"
            >
              {isCorrect ? '🐿️' : '🙈'}
            </span>
          </div>
        )}
        
        {/* Display image if present */}
        {hasImage && (
          <div className="mb-2 sm:mb-3">
            <img
              src={message.imageUrl || message.image}
              alt="Message attachment"
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ maxWidth: '100%', maxHeight: '400px' }}
            />
          </div>
        )}
        
        <div 
          className={`text-sm sm:text-base ${!isUser && !isError ? 'chat-message dark:text-gray-300' : ''}`}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        ></div>
        {!isUser && !isError && !isSystemAction && (
          <div className="mt-3 border-t border-orange-100 pt-2 dark:border-orange-900/50">
            {!isReporting && reportState === 'idle' && <button type="button" onClick={() => setIsReporting(true)} className="text-xs font-semibold text-orange-700 hover:text-orange-900 dark:text-orange-300">🔎 Mình thấy AI có thể sai</button>}
            {isReporting && reportState !== 'done' && <div className="space-y-2"><textarea value={correction} onChange={event => setCorrection(event.target.value)} rows="2" maxLength="2000" placeholder="Nêu ngắn gọn chỗ sai và cách đúng..." className="w-full rounded-lg border border-orange-200 bg-white px-2 py-1.5 text-xs outline-none focus:border-orange-500 dark:border-orange-800 dark:bg-orange-950/40" /><div className="flex items-center gap-2"><button type="button" onClick={reportError} disabled={reportState === 'loading' || correction.trim().length < 12} className="rounded-lg bg-orange-600 px-2.5 py-1 text-xs font-semibold text-white disabled:opacity-50">{reportState === 'loading' ? 'Đang kiểm tra...' : 'Gửi phát hiện'}</button><button type="button" onClick={() => setIsReporting(false)} className="text-xs text-slate-500">Huỷ</button>{reportState === 'error' && <span className="text-xs text-red-600">Chưa gửi được.</span>}{reportState === 'invalid' && <span className="text-xs text-amber-700">Chưa đủ căn cứ để xác nhận.</span>}</div></div>}
            {reportState === 'done' && <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Đã ghi nhận! Cảm ơn bạn đã kiểm tra lại lời giải.</p>}
          </div>
        )}
        {message.timestamp && (
          <span className={`block text-xs mt-1.5 sm:mt-2 ${isUser ? 'text-orange-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.timestamp}
          </span>
        )}
      </div>
      {/* Add avatar for user messages */}
      {isUser && (
        <div className="user-avatar ml-1.5 sm:ml-3 flex-shrink-0 text-xs sm:text-base w-6 h-6 sm:w-8 sm:h-8">{userAvatar}</div>
      )}
    </div>
  );
}

export default ChatMessage; 
