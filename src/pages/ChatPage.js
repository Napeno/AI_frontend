import React, { useState, useEffect } from 'react';
import { useChat } from '../hooks/useChat';
import { formatAIMessage } from '../utils/chatUtils';

// Components
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import Welcome from '../components/chat/Welcome';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import UserAnswerInput from '../components/chat/UserAnswerInput';
import ChatActions from '../components/chat/ChatActions';
import SealAnimation from '../components/SealAnimation';

const ChatPage = () => {
  const [coinAnimationTrigger, setCoinAnimationTrigger] = useState(null);
  const [sealAnimationTrigger, setSealAnimationTrigger] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [pointsAnimationTrigger, setPointsAnimationTrigger] = useState(null);
  
  const handleCoinAnimation = (animationData) => {
    setCoinAnimationTrigger(animationData);
  };

  const handlePointsAnimation = (animationData) => {
    setPointsAnimationTrigger(animationData);
  };

  const handleSealAnimation = (type, data = {}) => {
    setSealAnimationTrigger({ type, ...data, timestamp: Date.now() });
  };

  const handleBackgroundChange = (background) => {
    setCurrentBackground(background);
    // Store in localStorage for persistence
    if (background) {
      localStorage.setItem('chatBackground', JSON.stringify(background));
    } else {
      localStorage.removeItem('chatBackground');
    }
  };

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
    selectedImage,
    setSelectedImage,
    messagesEndRef,
    createNewChat,
    loadConversations,
    loadConversation,
    deleteConversation,
    sendMessage,
    sendImageMessage,
    continueChat,
    getFullAnswer,
    checkUserAnswer,
} = useChat(handleCoinAnimation, handlePointsAnimation);

  const [showSidebar, setShowSidebar] = useState(true);
  const [settingsSelected, setSettingsSelected] = useState(false);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Load background from localStorage on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('chatBackground');
    if (savedBackground) {
      try {
        setCurrentBackground(JSON.parse(savedBackground));
      } catch (error) {
        console.error('Error parsing saved background:', error);
        localStorage.removeItem('chatBackground');
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setSettingsSelected(true);
    }
  }, [messages]);

  // Trigger animation based on answer check results
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'check-answer') {
      const isCorrect = lastMessage.isCorrect;
      handleSealAnimation('check-answer', { isCorrect });
    }
  }, [messages]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
      handleSealAnimation('new-question');
    }
  };

  const handleAnswerKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkUserAnswer();
    }
  };

  const handleContinueChat = () => {
    continueChat();
    handleSealAnimation('hint');
  };

  const handleGetFullAnswer = () => {
    getFullAnswer();
    handleSealAnimation('full-answer');
  };

  const handleCheckAnswer = () => {
    checkUserAnswer();
    // Animation will be triggered based on the result in useEffect
  };

  const handleStartChat = (settings) => {
    createNewChat(settings);
    setSettingsSelected(true);
  };

  const handleNewChatClick = () => {
    setSettingsSelected(false);
    createNewChat({ educationLevel: 'middle', subjectArea: 'natural_sciences' });
  }

  return (
    <div className="h-screen bg-seablue-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        showSidebar={showSidebar}
        conversations={conversations}
        sessionId={sessionId}
        createNewChat={handleNewChatClick}
        loadConversation={loadConversation}
        deleteConversation={deleteConversation}
coinAnimationTrigger={coinAnimationTrigger}
        pointsAnimationTrigger={pointsAnimationTrigger}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <ChatHeader
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}
          currentConversationTitle={currentConversationTitle}
          onBackgroundChange={handleBackgroundChange}
          currentBackground={currentBackground}
        />

        {/* Chat Container - Fixed height with internal scroll */}
        <div 
          className="flex-1 chat-background dark:bg-gray-800 flex flex-col min-h-0"
          style={currentBackground ? {
            backgroundImage: `url(${currentBackground.path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {}}
          data-bg-image={currentBackground ? 'true' : undefined}
        >
          {/* Messages - Scrollable area */}
          <div className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700">
            {!settingsSelected && messages.length === 0 ? (
              <Welcome onStart={handleStartChat} />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  formatAIMessage={formatAIMessage}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start mb-5">
                <div className="seal-avatar mr-3">🦭</div>
                <div className="max-w-[70%] px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 border border-seablue-200 dark:border-gray-600 rounded-bl-md shadow-md">
                  <div className="flex items-center space-x-1">
                    <span className="w-2 h-2 bg-seablue-500 rounded-full animate-typing"></span>
                    <span className="w-2 h-2 bg-seablue-500 rounded-full animate-typing" style={{animationDelay: '-0.32s'}}></span>
                    <span className="w-2 h-2 bg-seablue-500 rounded-full animate-typing" style={{animationDelay: '-0.16s'}}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input - Fixed at bottom */}
          {settingsSelected && (
            <div className="flex-shrink-0 p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {/* Main chat input */}
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                sendMessage={sendMessage}
                handleKeyPress={handleKeyPress}
                isLoading={isLoading}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
                sendImageMessage={sendImageMessage}
              />
              
              {/* User answer input when enabled */}
              {showAnswerInput && (
                <UserAnswerInput
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  checkUserAnswer={handleCheckAnswer}
                  isLoading={isLoading}
                  handleAnswerKeyPress={handleAnswerKeyPress}
                  messages={messages}
                />
              )}
              
              {/* Action buttons */}
              <ChatActions
                hintCount={hintCount}
                continueChat={handleContinueChat}
                getFullAnswer={handleGetFullAnswer}
                isLoading={isLoading}
                showActions={messages.length > 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* SealEdu Animation */}
      <SealAnimation 
        trigger={sealAnimationTrigger}
        onComplete={() => setSealAnimationTrigger(null)}
      />
    </div>
  );
};

export default ChatPage; 