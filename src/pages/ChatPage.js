import React, { useCallback, useEffect, useState } from 'react';
import { useChat } from '../hooks/useChat';
import { formatAIMessage } from '../utils/chatUtils';
import t from '../locales/i18n';
import { useAuth } from '../context/AuthContext';
import { AVATAR_EMOJIS } from '../utils/avatarUtils';
import ChatRail from '../components/sidebar/ChatRail';
import Sidebar from '../components/sidebar/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import Welcome from '../components/chat/Welcome';
import NewChatModal from '../components/chat/NewChatModal';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import UserAnswerInput from '../components/chat/UserAnswerInput';
import ChatActions from '../components/chat/ChatActions';
import InterventionGate from '../components/chat/InterventionGate';

const CHAT_COOLDOWN_SECONDS = 3;
const DEFAULT_CHAT_SETTINGS = { educationLevel: 'middle', subjectArea: 'natural_sciences', course: 'mathematics' };

const ChatPage = () => {
  const { user } = useAuth();
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [coinAnimationTrigger, setCoinAnimationTrigger] = useState(null);
  const [pointsAnimationTrigger, setPointsAnimationTrigger] = useState(null);
  const [currentBackground, setCurrentBackground] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [settingsSelected, setSettingsSelected] = useState(true);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const userAvatar = AVATAR_EMOJIS[user?.avatar || 'default'] || '👤';
  const isCoolingDown = cooldownRemaining > 0;

  const {
    messages, inputMessage, setInputMessage, userAnswer, setUserAnswer, sessionId, isLoading, conversations,
    currentConversationTitle, hintCount, selectedImage, setSelectedImage, supportMode, clearSupportMode,
    intervention, problemContext, setActiveQuestion, messagesEndRef, createNewChat, loadConversations,
    loadConversation, deleteConversation, sendMessage, sendImageMessage, continueChat, getFullAnswer,
    checkUserAnswer, checkUserAnswerWithImage,
  } = useChat(setCoinAnimationTrigger, setPointsAnimationTrigger);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const saved = localStorage.getItem('chatBackground');
    if (saved) {
      try {
        const background = JSON.parse(saved);
        if (background?.id !== 'default') setCurrentBackground(background);
      } catch { localStorage.removeItem('chatBackground'); }
    }
  }, []);

  useEffect(() => {
    if (!isHistoryOpen) return undefined;
    const closeOnEscape = event => { if (event.key === 'Escape') setIsHistoryOpen(false); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [isHistoryOpen]);

  useEffect(() => {
    if (!cooldownRemaining) return undefined;
    const intervalId = setInterval(() => setCooldownRemaining(value => (value > 1 ? value - 1 : 0)), 1000);
    return () => clearInterval(intervalId);
  }, [cooldownRemaining]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return undefined;
    const updateOffset = () => setKeyboardOffset(window.innerWidth < 768 ? Math.max(0, window.innerHeight - viewport.height) : 0);
    updateOffset();
    viewport.addEventListener('resize', updateOffset);
    return () => viewport.removeEventListener('resize', updateOffset);
  }, []);

  const handleBackgroundChange = background => {
    setCurrentBackground(background);
    if (background) localStorage.setItem('chatBackground', JSON.stringify(background));
    else localStorage.removeItem('chatBackground');
  };

  const startCooldown = useCallback(() => setCooldownRemaining(CHAT_COOLDOWN_SECONDS), []);
  const handleSendMessage = useCallback(async () => {
    if (isLoading || isCoolingDown || (!selectedImage && !inputMessage.trim())) return;
    try { selectedImage ? await sendImageMessage(selectedImage, inputMessage) : await sendMessage(); }
    finally { startCooldown(); }
  }, [inputMessage, isCoolingDown, isLoading, selectedImage, sendImageMessage, sendMessage, startCooldown]);

  const handleKeyPress = event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendMessage(); }
  };
  const handleGateSubmit = useCallback(async response => {
    if (!isLoading) await (intervention?.type === 'full_answer_gate' ? getFullAnswer(response) : continueChat(response));
  }, [continueChat, getFullAnswer, intervention?.type, isLoading]);
  const handleContinueChat = useCallback(async () => {
    if (isLoading || isCoolingDown) return;
    try { await continueChat(); } finally { startCooldown(); }
  }, [continueChat, isCoolingDown, isLoading, startCooldown]);
  const handleFullAnswer = useCallback(async () => {
    if (isLoading || isCoolingDown) return;
    try { await getFullAnswer(); } finally { startCooldown(); }
  }, [getFullAnswer, isCoolingDown, isLoading, startCooldown]);
  const handleNewChat = useCallback(() => {
    createNewChat(DEFAULT_CHAT_SETTINGS);
    setSettingsSelected(true);
    setIsHistoryOpen(false);
  }, [createNewChat]);
  const handleConfiguredChat = settings => {
    createNewChat(settings);
    setSettingsSelected(true);
    setIsChatSettingsOpen(false);
    setIsHistoryOpen(false);
  };
  const isEmptyChat = settingsSelected && messages.length === 0;
  const input = <ChatInput inputMessage={inputMessage} setInputMessage={setInputMessage} isLoading={isLoading} isCoolingDown={isCoolingDown} cooldownRemaining={cooldownRemaining} onSend={handleSendMessage} handleKeyPress={handleKeyPress} selectedImage={selectedImage} setSelectedImage={setSelectedImage} supportMode={supportMode} />;

  return <div className="flex h-[100dvh] overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
    <ChatRail onNewChat={handleNewChat} onOpenHistory={() => setIsHistoryOpen(true)} coinAnimationTrigger={coinAnimationTrigger} pointsAnimationTrigger={pointsAnimationTrigger} onBackgroundChange={handleBackgroundChange} currentBackground={currentBackground} />
    {isHistoryOpen && <div className="fixed inset-0 z-50 md:left-14" role="dialog" aria-modal="true" aria-label="Lịch sử trò chuyện">
      <button type="button" aria-label="Đóng lịch sử" onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
      <div className="relative h-full"><Sidebar conversations={conversations} sessionId={sessionId} createNewChat={handleNewChat} loadConversation={loadConversation} deleteConversation={deleteConversation} onClose={() => setIsHistoryOpen(false)} /></div>
    </div>}
    <main className="flex min-w-0 flex-1 flex-col bg-white dark:bg-slate-950">
      <ChatHeader currentConversationTitle={currentConversationTitle} intervention={intervention} onOpenHistory={() => setIsHistoryOpen(true)} onOpenSettings={() => setIsChatSettingsOpen(true)} onBackgroundChange={handleBackgroundChange} currentBackground={currentBackground} />
      <section className={`flex min-h-0 flex-1 flex-col ${currentBackground ? 'chat-background' : 'bg-slate-50 dark:bg-slate-900'}`} style={currentBackground ? { backgroundImage: `url(${currentBackground.path})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
        {isEmptyChat ? <Welcome>{input}</Welcome> : <>
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
            <div className="mx-auto max-w-3xl">
              {messages.map(message => <ChatMessage key={message.id} message={message} formatAIMessage={formatAIMessage} userAvatar={userAvatar} />)}
              {isLoading && <div className="mb-5 flex justify-start"><div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"><span className="inline-flex gap-1"><i className="h-2 w-2 animate-bounce rounded-full bg-cyan-500" /><i className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:150ms]" /><i className="h-2 w-2 animate-bounce rounded-full bg-cyan-500 [animation-delay:300ms]" /></span></div></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
          {settingsSelected && <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950" style={{ paddingBottom: keyboardOffset ? `${keyboardOffset + 12}px` : undefined }}>
            <div className="mx-auto max-w-3xl">
              {supportMode !== 'calculation' ? input : <UserAnswerInput userAnswer={userAnswer} setUserAnswer={setUserAnswer} checkUserAnswer={checkUserAnswer} checkUserAnswerWithImage={checkUserAnswerWithImage} isLoading={isLoading} handleAnswerKeyPress={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); checkUserAnswer(); } }} messages={messages} problemContext={problemContext} setActiveQuestion={setActiveQuestion} title={t('errorCheck.title')} description={t('errorCheck.description')} placeholder={t('errorCheck.placeholder')} buttonLabel={t('errorCheck.button')} showProblemContext={false} onBack={clearSupportMode} />}
              {supportMode !== 'calculation' && messages.some(message => message.sender === 'bot') && <InterventionGate intervention={intervention} isLoading={isLoading} onSubmit={handleGateSubmit} />}
              {supportMode !== 'calculation' && <ChatActions hintCount={hintCount} continueChat={handleContinueChat} getFullAnswer={handleFullAnswer} isLoading={isLoading} isCoolingDown={isCoolingDown} cooldownRemaining={cooldownRemaining} intervention={intervention} showActions={messages.length > 0} showHint />}
            </div>
          </div>}
        </>}
      </section>
    </main>
    <NewChatModal isOpen={isChatSettingsOpen} onClose={() => setIsChatSettingsOpen(false)} onStartChat={handleConfiguredChat} />
  </div>;
};

export default ChatPage;
