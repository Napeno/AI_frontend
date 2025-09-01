import React, { useState, useEffect } from 'react';
import { getLanguage } from '../locales/i18n';
import { useChat } from '../hooks/useChat';
import { formatAIMessage } from '../utils/chatUtils';

// Components
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import ChatWelcome from '../components/chat/ChatWelcome';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import UserAnswerInput from '../components/chat/UserAnswerInput';
import ChatActions from '../components/chat/ChatActions';

const ChatPage = () => {
  const {
    messages,
    inputMessage,
    setInputMessage,
    userAnswer,
    setUserAnswer,
    sessionId,
    isLoading,
    conversations,
    currentConversationTitle,
    hintCount,
    showAnswerInput,
    messagesEndRef,
    createNewChat,
    loadConversations,
    loadConversation,
    deleteConversation,
    sendMessage,
    continueChat,
    getFullAnswer,
    checkUserAnswer
  } = useChat();

  const [showSidebar, setShowSidebar] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(getLanguage());

  useEffect(() => {
    loadConversations();
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAnswerKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkUserAnswer();
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        showSidebar={showSidebar}
        conversations={conversations}
        sessionId={sessionId}
        createNewChat={createNewChat}
        loadConversation={loadConversation}
        deleteConversation={deleteConversation}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          currentConversationTitle={currentConversationTitle}
          onLanguageChange={handleLanguageChange}
        />

        {/* Chat Container - Fixed height with internal scroll */}
        <div className="flex-1 bg-gray-50 flex flex-col min-h-0">
          {/* Messages - Scrollable area */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {messages.length === 0 && <ChatWelcome />}
            
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                formatAIMessage={formatAIMessage}
              />
            ))}
            
            {isLoading && (
              <div className="flex justify-start mb-5">
                <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-white border border-gray-200 rounded-bl-md shadow-md">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-typing"></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-typing" style={{animationDelay: '-0.32s'}}></span>
                    <span className="w-2 h-2 bg-indigo-500 rounded-full animate-typing" style={{animationDelay: '-0.16s'}}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input - Fixed at bottom */}
          <div className="flex-shrink-0 p-6 bg-white border-t border-gray-200">
            {/* Main chat input */}
            <ChatInput
              inputMessage={inputMessage}
              setInputMessage={setInputMessage}
              sendMessage={sendMessage}
              handleKeyPress={handleKeyPress}
              isLoading={isLoading}
            />
            
            {/* User answer input when enabled */}
            {showAnswerInput && (
              <UserAnswerInput
                userAnswer={userAnswer}
                setUserAnswer={setUserAnswer}
                checkUserAnswer={checkUserAnswer}
                isLoading={isLoading}
              />
            )}
            
            {/* Action buttons */}
            <ChatActions
              hintCount={hintCount}
              continueChat={continueChat}
              getFullAnswer={getFullAnswer}
              isLoading={isLoading}
              showActions={messages.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 