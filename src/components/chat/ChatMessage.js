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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-md'
            : isError
            ? 'bg-red-500 text-white rounded-bl-md'
            : 'bg-white border border-gray-200 rounded-bl-md'
        }`}
      >
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