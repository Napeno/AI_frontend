import React from 'react';
import { formatAIMessage } from '../../utils/chatUtils';

function ChatMessage({ message, formatAIMessage }) {
  console.log('Message received by ChatMessage:', message);

  const isUser = message.sender === 'user';
  const isError = message.isError;

  const messageContent = message.text || '';

  console.log('messageContent in ChatMessage:', messageContent, typeof messageContent);

  const formattedContent = isUser || isError
    ? messageContent
    : formatAIMessage(messageContent);

  console.log('formattedContent in ChatMessage:', formattedContent, typeof formattedContent);

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