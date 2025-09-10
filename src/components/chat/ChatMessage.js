import React from 'react';
import { formatAIMessage } from '../../utils/chatUtils';

function ChatMessage({ message, formatAIMessage, userAvatar }) {

  const isUser = message.sender === 'user';
  const isError = message.isError;
  const isContinue = message.sender === 'continue';
  const isFullAnswer = message.sender === 'full-answer';
  const isCheckAnswer = message.sender === 'check-answer';
  const isCoinAward = message.sender === 'system' && message.type === 'coin-award';
  const isSystemAction = isContinue || isFullAnswer || isCheckAnswer || isCoinAward;

  const messageContent = message.text || '';
  const hasImage = message.imageUrl || message.image;


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
      <div className="flex justify-center mb-5">
        <div className={`max-w-[80%] px-5 py-3 rounded-full shadow-sm border-2 border-dashed ${bgColor} ${borderColor} ${textColor}`}>
          <div className="flex items-center justify-center gap-3">
            {isCoinAward && (
              <div className="text-xl">
                {icon}
              </div>
            )}
            <span className="text-base font-semibold flex items-center gap-2">
              {!isCoinAward &&(
                <>
                 {isContinue &&(
                  <img
                    src="/gif/loading.gif"
                    alt="loading"
                    className="w-12 h-12 inline-block align-middle"
                  />
                )}
                {(isCheckAnswer || isFullAnswer) &&(
                  <img
                    src="/gif/thinking.gif"
                    alt="thinking"
                    className="w-12 h-12 inline-block align-middle"
                  />
                )}
                </>
              )}
              {formattedContent}
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

  let containerClasses = "max-w-[80%] px-5 py-4 rounded-2xl shadow-md";
  if (isUser) {
    containerClasses += " bg-gradient-to-r from-ocean-medium to-ocean-deep text-white rounded-br-md";
  } else if (isError) {
    containerClasses += " bg-red-500 text-white rounded-bl-md";
  } else if (isCorrect) {
    containerClasses += " bg-green-50 border border-green-300 rounded-bl-md dark:bg-green-900/50 dark:border-green-700";
  } else if (isIncorrect) {
    containerClasses += " bg-red-50 border border-red-300 rounded-bl-md dark:bg-red-900/50 dark:border-red-700";
  } else {
    containerClasses += " bg-white border border-seablue-200 rounded-bl-md dark:bg-gray-700 dark:border-gray-600";
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {/* Add avatar for AI messages */}
      {!isUser && (
        <div className="seal-avatar mr-3 flex-shrink-0">
          <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-6 h-6" />
        </div>
      )}
      <div className={containerClasses}>
        {isIncorrect && (
          <div className="flex items-center mb-2 font-bold text-red-600 dark:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Câu trả lời chưa chính xác</span>
          </div>
        )}
        {isCorrect && (
          <div className="flex items-center mb-2 font-bold text-green-600 dark:text-green-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Câu trả lời chính xác!</span>
          </div>
        )}

        {/* Centered status image for correct/incorrect */}
        {(isCorrect || isIncorrect) && (
          <div className="flex justify-center my-2">
            <img
              src={isCorrect ? '/image/seal-happy.png' : '/image/seal-sad.png'}
              alt={isCorrect ? 'correct' : 'incorrect'}
              className="w-24 h-24 object-contain"
            />
          </div>
        )}
        
        {/* Display image if present */}
        {hasImage && (
          <div className="mb-3">
            <img
              src={message.imageUrl || message.image}
              alt="Message attachment"
              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
              style={{ maxWidth: '520px', maxHeight: '520px' }}
            />
          </div>
        )}
        
        <div 
          className={`${!isUser && !isError ? 'chat-message dark:text-gray-300' : ''}`}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        ></div>
        {message.timestamp && (
          <span className={`block text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.timestamp}
          </span>
        )}
      </div>
      {/* Add avatar for user messages */}
      {isUser && (
        <div className="user-avatar ml-3 flex-shrink-0">{userAvatar}</div>
      )}
    </div>
  );
}

export default ChatMessage; 