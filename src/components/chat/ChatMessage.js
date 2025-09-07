import React from 'react';
import { formatAIMessage } from '../../utils/chatUtils';

function ChatMessage({ message, formatAIMessage }) {

  const isUser = message.sender === 'user';
  const isError = message.isError;
  const isContinue = message.sender === 'continue';
  const isFullAnswer = message.sender === 'full-answer';
  const isCheckAnswer = message.sender === 'check-answer';
  const isSystemAction = isContinue || isFullAnswer || isCheckAnswer;

  const messageContent = message.text || '';


  const formattedContent = isUser || isError || isSystemAction
    ? messageContent
    : formatAIMessage(messageContent);


  // Different styling for system actions (continue, full-answer, check-answer)
  if (isSystemAction) {
    let bgColor, borderColor, textColor, icon;
    
    if (isContinue) {
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-300';
      textColor = 'text-yellow-700';
      icon = '💭';
    } else if (isFullAnswer) {
      bgColor = 'bg-purple-50';
      borderColor = 'border-purple-300';
      textColor = 'text-purple-700';
      icon = '📖';
    } else if (isCheckAnswer) {
      bgColor = 'bg-green-50';
      borderColor = 'border-green-300';
      textColor = 'text-green-700';
      icon = '🔍';
    }
    
    return (
      <div className="flex justify-center mb-4">
        <div className={`max-w-[70%] px-4 py-2 rounded-full shadow-sm border-2 border-dashed ${bgColor} ${borderColor} ${textColor}`}>
          <div className="flex items-center justify-center gap-2">
            <div>
              {icon}
            </div>
            <span className="text-sm font-medium">
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

  let containerClasses = "max-w-[70%] px-4 py-3 rounded-2xl shadow-md";
  if (isUser) {
    containerClasses += " bg-blue-500 text-white rounded-br-md";
  } else if (isError) {
    containerClasses += " bg-red-500 text-white rounded-bl-md";
  } else if (isCorrect) {
    containerClasses += " bg-green-50 border border-green-300 rounded-bl-md";
  } else if (isIncorrect) {
    containerClasses += " bg-red-50 border border-red-300 rounded-bl-md";
  } else {
    containerClasses += " bg-white border border-gray-200 rounded-bl-md";
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={containerClasses}>
        {isIncorrect && (
          <div className="flex items-center mb-2 font-bold text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Câu trả lời chưa chính xác</span>
          </div>
        )}
        {isCorrect && (
          <div className="flex items-center mb-2 font-bold text-green-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Câu trả lời chính xác!</span>
          </div>
        )}
        <div 
          className={`${!isUser && !isError ? 'chat-message' : ''}`}
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        ></div>
        {message.timestamp && (
          <span className={`block text-xs mt-2 ${isUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {message.timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

export default ChatMessage; 