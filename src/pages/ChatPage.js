import React, { useState, useEffect, useCallback } from 'react';
import { useChat } from '../hooks/useChat';
import { formatAIMessage } from '../utils/chatUtils';
import { useAuth } from '../context/AuthContext';
import { AVATAR_EMOJIS } from '../utils/avatarUtils';

// Components
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import Welcome from '../components/chat/Welcome';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import UserAnswerInput from '../components/chat/UserAnswerInput';
import ChatActions from '../components/chat/ChatActions';
// import SealAnimation from '../components/SealAnimation';

const CHAT_COOLDOWN_SECONDS = 10;

const ChatPage = () => {
  const { user } = useAuth();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [coinAnimationTrigger, setCoinAnimationTrigger] = useState(null);
  const [sealAnimationTrigger, setSealAnimationTrigger] = useState(null);
  const [currentBackground, setCurrentBackground] = useState({
    id: 'default',
    name: 'Mặc định',
    region: 'SealEdu',
    path: '/background/default.jpeg'
  }); // Set default background
  const [pointsAnimationTrigger, setPointsAnimationTrigger] = useState(null);
  
  const userAvatar = AVATAR_EMOJIS[user?.avatar || 'default'] || '👤';

  const handleCoinAnimation = (animationData) => {
    setCoinAnimationTrigger(animationData);
  };

  const handlePointsAnimation = (animationData) => {
    setPointsAnimationTrigger(animationData);
  };

  // const handleSealAnimation = (type, data = {}) => {
  //   setSealAnimationTrigger({ type, ...data, timestamp: Date.now() });
  // };

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
    checkUserAnswerWithImage,
} = useChat(handleCoinAnimation, handlePointsAnimation);

  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const [settingsSelected, setSettingsSelected] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const isCoolingDown = cooldownRemaining > 0;

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
        // Keep the default background if parsing fails
      }
    }
    // If no saved background, keep the default background that's already set
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setSettingsSelected(true);
    }
  }, [messages]);

  useEffect(() => {
    if (!cooldownRemaining) return;

    const intervalId = setInterval(() => {
      setCooldownRemaining(prev => (prev > 1 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [cooldownRemaining]);

  useEffect(() => {
    if (messages.length === 0) {
      setCooldownRemaining(0);
    }
  }, [messages]);

  // Stable mobile keyboard handling using VisualViewport
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    
    const updateOffset = () => {
      // Only apply on mobile screens
      if (window.innerWidth < 768) {
        const keyboardHeight = Math.max(0, window.innerHeight - vv.height);
        setKeyboardOffset(keyboardHeight);
      } else {
        setKeyboardOffset(0);
      }
    };
    
    updateOffset();
    vv.addEventListener('resize', updateOffset);
    window.addEventListener('orientationchange', () => {
      setTimeout(updateOffset, 100); // Delay to allow orientation change
    });
    
    return () => {
      vv.removeEventListener('resize', updateOffset);
      window.removeEventListener('orientationchange', updateOffset);
    };
  }, []);

  // Trigger animation based on answer check results
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.sender === 'check-answer') {
      const isCorrect = lastMessage.isCorrect;
      // handleSealAnimation('check-answer', { isCorrect });
    }
  }, [messages]);

  const startCooldown = useCallback(() => {
    setCooldownRemaining(CHAT_COOLDOWN_SECONDS);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (isLoading || isCoolingDown) return;

    const hasImageAttached = Boolean(selectedImage);
    const hasText = inputMessage.trim().length > 0;

    if (!hasImageAttached && !hasText) {
      return;
    }

    try {
      if (hasImageAttached) {
        await sendImageMessage(selectedImage, inputMessage);
      } else {
        await sendMessage();
      }
    } finally {
      startCooldown();
    }
  }, [inputMessage, isCoolingDown, isLoading, selectedImage, sendImageMessage, sendMessage, startCooldown]);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      if (isCoolingDown) {
        return;
      }

      handleSendMessage();
      // handleSealAnimation('new-question');
    }
  };

  const handleAnswerKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      checkUserAnswer();
    }
  };

  const handleContinueChat = useCallback(async () => {
    if (isLoading || isCoolingDown) return;

    try {
      await continueChat();
      // handleSealAnimation('hint');
    } finally {
      startCooldown();
    }
  }, [continueChat, isCoolingDown, isLoading, startCooldown]);

  const handleGetFullAnswer = useCallback(async () => {
    if (isLoading || isCoolingDown) return;

    try {
      await getFullAnswer();
      // handleSealAnimation('full-answer');
    } finally {
      startCooldown();
    }
  }, [getFullAnswer, isCoolingDown, isLoading, startCooldown]);

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
    <div className="h-screen bg-seablue-50 dark:bg-gray-900 flex overflow-hidden relative safari-transform-fix">
      
      {/* Sidebar */}
      {/* Desktop sidebar (push layout) */}
      <div className={`${showSidebar ? 'w-80 sm:w-72 md:w-80' : 'w-0'} md:w-80 transition-[width] duration-300 ease-out overflow-hidden h-full flex-shrink-0 hidden md:block`}>
        <Sidebar
          showSidebar={true}
          conversations={conversations}
          sessionId={sessionId}
          createNewChat={handleNewChatClick}
          loadConversation={loadConversation}
          deleteConversation={deleteConversation}
          coinAnimationTrigger={coinAnimationTrigger}
          pointsAnimationTrigger={pointsAnimationTrigger}
        />
      </div>

      {/* Mobile sidebar (overlay with white background and close button) */}
      <div className={`md:hidden fixed inset-0 z-50 transition-opacity duration-300 ${showSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`w-full h-full bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-out ${showSidebar ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <div className="p-3 sm:p-4 border-b border-seablue-200 dark:border-gray-700 flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">Menu</div>
            <button
              onClick={() => setShowSidebar(false)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-seablue-50 dark:hover:bg-gray-800 rounded-lg"
              aria-label="Close sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar
              showSidebar={true}
              conversations={conversations}
              sessionId={sessionId}
              createNewChat={handleNewChatClick}
              loadConversation={loadConversation}
              deleteConversation={deleteConversation}
              coinAnimationTrigger={coinAnimationTrigger}
              pointsAnimationTrigger={pointsAnimationTrigger}
            />
          </div>
        </div>
      </div>

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
          <div className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-700 scrollable-content">
            {!settingsSelected && messages.length === 0 ? (
              <Welcome onStart={handleStartChat} />
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  formatAIMessage={formatAIMessage}
                  userAvatar={userAvatar}
                />
              ))
            )}
            
            {isLoading && (
              <div className="flex justify-start mb-5">
                <div className="seal-avatar mr-3">
                  <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-6 h-6" />
                </div>
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
            <div 
              className="flex-shrink-0 p-2 sm:p-4 lg:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 max-h-[50vh] overflow-y-auto sm:max-h-none input-container" 
              style={{ paddingBottom: keyboardOffset ? `${keyboardOffset + 8}px` : undefined }}
            >
              {/* Main chat input */}
              <ChatInput
                inputMessage={inputMessage}
                setInputMessage={setInputMessage}
                isLoading={isLoading}
                isCoolingDown={isCoolingDown}
                cooldownRemaining={cooldownRemaining}
                onSend={handleSendMessage}
                handleKeyPress={handleKeyPress}
                selectedImage={selectedImage}
                setSelectedImage={setSelectedImage}
              />
              
              {/* User answer input when enabled */}
              {showAnswerInput && (
                <UserAnswerInput
                  userAnswer={userAnswer}
                  setUserAnswer={setUserAnswer}
                  checkUserAnswer={handleCheckAnswer}
                  checkUserAnswerWithImage={checkUserAnswerWithImage}
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
                isCoolingDown={isCoolingDown}
                cooldownRemaining={cooldownRemaining}
                showActions={messages.length > 0}
              />
            </div>
          )}
        </div>
      </div>

      {/* SealEdu Animation */}
      {/* <SealAnimation 
        trigger={sealAnimationTrigger}
        onComplete={() => setSealAnimationTrigger(null)}
      /> */}
    </div>
  );
};

export default ChatPage; 
