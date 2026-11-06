import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useChat } from '../hooks/useChat';
import { formatAIMessage } from '../utils/chatUtils';
import t from '../locales/i18n';
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
import RewardCelebration from '../components/chat/RewardCelebration';

const CHAT_COOLDOWN_SECONDS = 3;
const DEFAULT_CHAT_SETTINGS = { educationLevel: 'middle', subjectArea: 'mathematics', course: 'mathematics' };

const ChatPage = () => {
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [coinAnimationTrigger, setCoinAnimationTrigger] = useState(null);
  const [rewardCelebration, setRewardCelebration] = useState(null);
  const lastRewardIdRef = useRef(null);
  const rewardInitializedRef = useRef(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChatSettingsOpen, setIsChatSettingsOpen] = useState(false);
  const [isSubjectPickerOpen, setIsSubjectPickerOpen] = useState(false);
  const subjectPickerSeenRef = useRef(false);
  const [settingsSelected, setSettingsSelected] = useState(true);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [composerIntent, setComposerIntent] = useState('answer');
  const [searchParams] = useSearchParams();
  const restoredSessionRef = useRef('');
  const userAvatar = '/studentAI.png';
  const isCoolingDown = cooldownRemaining > 0;

  const {
    messages, inputMessage, setInputMessage, userAnswer, setUserAnswer, sessionId, isLoading, conversations,
    currentConversationTitle, hintCount, selectedImage, setSelectedImage, supportMode, clearSupportMode,
    intervention, problemContext, setActiveQuestion, messagesEndRef, createNewChat, loadConversations,
    loadConversation, deleteConversation, sendMessage, sendImageMessage, continueChat, getFullAnswer,
    checkUserAnswer, checkUserAnswerWithImage,
  } = useChat(setCoinAnimationTrigger);

  useEffect(() => {
    const rewardMessage = [...messages].reverse().find(message => message.type === 'chestnut-award');
    if (!rewardInitializedRef.current && messages.length > 0) {
      rewardInitializedRef.current = true;
      lastRewardIdRef.current = rewardMessage?.id || null;
      return;
    }
    if (rewardMessage && rewardMessage.id !== lastRewardIdRef.current) {
      lastRewardIdRef.current = rewardMessage.id;
      setRewardCelebration({ chestnuts: 5, id: rewardMessage.id });
    }
  }, [messages]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  useEffect(() => {
    const requestedSessionId = searchParams.get('sessionId');
    if (!requestedSessionId || restoredSessionRef.current === requestedSessionId) return;
    restoredSessionRef.current = requestedSessionId;
    loadConversation(requestedSessionId);
  }, [searchParams, loadConversation]);

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

  const startCooldown = useCallback(() => setCooldownRemaining(CHAT_COOLDOWN_SECONDS), []);
  const handleSendMessage = useCallback(async () => {
    if (isLoading || isCoolingDown || (!selectedImage && !inputMessage.trim())) return;
    try { selectedImage ? await sendImageMessage(selectedImage, inputMessage) : await sendMessage(); }
    finally { startCooldown(); }
  }, [inputMessage, isCoolingDown, isLoading, selectedImage, sendImageMessage, sendMessage, startCooldown]);

  const handleKeyPress = event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendMessage(); }
  };
  const latestBotIndex = messages.reduce((index, message, currentIndex) => (
    message.sender === 'bot' ? currentIndex : index
  ), -1);
  const latestBotMessage = messages[latestBotIndex];
  const isClarificationMessage = latestBotMessage?.evaluationStatus === 'uncertain'
    || /(?:^|\n)\s*(?:💬\s*)?cần làm rõ\b/i.test(latestBotMessage?.text || '')
    || /(?:^|\n)\s*(?:💬\s*)?need clarification\b/i.test(latestBotMessage?.text || '');
  const isFollowUpQuestion = !latestBotMessage?.evaluationStatus
    && /\?|\b(?:bao nhiêu|thế nào|đúng không|phải không|hay không)\b/i.test(latestBotMessage?.text || '');
  const canCheckAnswer = supportMode !== 'calculation'
    && (isClarificationMessage || isFollowUpQuestion)
    && !messages.slice(latestBotIndex + 1).some(message => message.sender === 'user');
  const answerMode = canCheckAnswer && composerIntent === 'answer';

  useEffect(() => {
    if (canCheckAnswer) setComposerIntent('answer');
  }, [canCheckAnswer, latestBotMessage?.id]);

  const handleAnswerKeyPress = event => {
    if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); handleSendAnswer(); }
  };
  const handleSendAnswer = useCallback(async () => {
    if (isLoading || isCoolingDown || (!selectedImage && !userAnswer.trim())) return;
    if (selectedImage) {
      try {
        await checkUserAnswerWithImage(selectedImage, userAnswer);
      } finally {
        setSelectedImage(null);
        startCooldown();
      }
    } else {
      try {
        await checkUserAnswer();
      } finally {
        startCooldown();
      }
    }
  }, [checkUserAnswer, checkUserAnswerWithImage, isCoolingDown, isLoading, selectedImage, setSelectedImage, startCooldown, userAnswer]);
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
    subjectPickerSeenRef.current = false;
    setSettingsSelected(true);
    setIsHistoryOpen(false);
  }, [createNewChat]);
  const handleConfiguredChat = settings => {
    createNewChat(settings);
    subjectPickerSeenRef.current = true;
    setSettingsSelected(true);
    setIsChatSettingsOpen(false);
    setIsHistoryOpen(false);
  };
  const isEmptyChat = settingsSelected && messages.length === 0;
  const input = (
    <ChatInput
      inputMessage={inputMessage}
      setInputMessage={setInputMessage}
      isLoading={isLoading}
      isCoolingDown={isCoolingDown}
      cooldownRemaining={cooldownRemaining}
      onSend={handleSendMessage}
      handleKeyPress={answerMode ? handleAnswerKeyPress : handleKeyPress}
      selectedImage={selectedImage}
      setSelectedImage={setSelectedImage}
      supportMode={supportMode}
      canCheckAnswer={canCheckAnswer}
      composerIntent={composerIntent}
      onComposerIntentChange={setComposerIntent}
      answerValue={userAnswer}
      setAnswerValue={setUserAnswer}
      onSendAnswer={handleSendAnswer}
      onOpenSubjectPicker={isEmptyChat ? () => setIsSubjectPickerOpen(true) : undefined}
    />
  );

  return <div className="chat-shell flex h-[100dvh] overflow-hidden">
    <RewardCelebration reward={rewardCelebration} />
    <ChatRail onNewChat={handleNewChat} onOpenHistory={() => setIsHistoryOpen(true)} coinAnimationTrigger={coinAnimationTrigger} />
    {isHistoryOpen && <div className="fixed inset-0 z-50 md:left-14" role="dialog" aria-modal="true" aria-label="Lịch sử trò chuyện">
      <button type="button" aria-label="Đóng lịch sử" onClick={() => setIsHistoryOpen(false)} className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px]" />
      <div className="relative h-full"><Sidebar conversations={conversations} sessionId={sessionId} createNewChat={handleNewChat} loadConversation={loadConversation} deleteConversation={deleteConversation} onClose={() => setIsHistoryOpen(false)} /></div>
    </div>}
    <main className="chat-main flex min-w-0 flex-1 flex-col">
      <ChatHeader currentConversationTitle={currentConversationTitle} intervention={intervention} onOpenHistory={() => setIsHistoryOpen(true)} onOpenSettings={() => setIsChatSettingsOpen(true)} onNewChat={handleNewChat} />
      <section className="chat-canvas flex min-h-0 flex-1 flex-col">
        {isEmptyChat ? <Welcome>{input}</Welcome> : <>
          <div className="flex-1 overflow-y-auto px-3 py-3 sm:px-6 sm:py-6">
            <div className="mx-auto max-w-3xl">
              {messages.map(message => <ChatMessage key={message.id} message={message} formatAIMessage={formatAIMessage} userAvatar={userAvatar} sessionId={sessionId} />)}
              {problemContext?.questions?.length > 0 && sessionId && (
                <div className="mb-2 flex justify-start sm:mb-5 sm:justify-center">
                  <Link
                    to={`/ai-tutor/${sessionId}?questionId=${encodeURIComponent(problemContext.activeQuestionId || problemContext.suggestedQuestionId || 'main')}`}
                    className="inline-flex items-center gap-1 rounded-full border border-orange-200/80 bg-orange-50/90 px-2.5 py-1 text-[11px] font-semibold text-orange-800 transition hover:bg-orange-100 sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-sm sm:font-bold"
                  >
                    <img src="/avatar.png" alt="" className="h-3.5 w-3.5 object-contain sm:h-5 sm:w-5" />
                    <span className="sm:hidden">AI Tutor</span>
                    <span className="hidden sm:inline">Luyện bài này với AI Tutor</span>
                  </Link>
                </div>
              )}
              {isLoading && <div className="mb-5 flex justify-start"><div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"><span className="inline-flex gap-1"><i className="h-2 w-2 animate-bounce rounded-full bg-orange-500" /><i className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:150ms]" /><i className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:300ms]" /></span></div></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>
          {settingsSelected && (
            <div
              className="chat-composer shrink-0 px-3 py-2 sm:px-4 sm:py-3"
              style={{ paddingBottom: keyboardOffset ? `${keyboardOffset + 10}px` : undefined }}
            >
              <div className="mx-auto max-w-3xl">
                {supportMode !== 'calculation' ? input : (
                  <UserAnswerInput
                    userAnswer={userAnswer}
                    setUserAnswer={setUserAnswer}
                    checkUserAnswer={checkUserAnswer}
                    checkUserAnswerWithImage={checkUserAnswerWithImage}
                    isLoading={isLoading}
                    handleAnswerKeyPress={event => {
                      if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        checkUserAnswer();
                      }
                    }}
                    messages={messages}
                    problemContext={problemContext}
                    setActiveQuestion={setActiveQuestion}
                    title={t('errorCheck.title')}
                    description={t('errorCheck.description')}
                    placeholder={t('errorCheck.placeholder')}
                    buttonLabel={t('errorCheck.button')}
                    showProblemContext={false}
                    onBack={clearSupportMode}
                  />
                )}
                {supportMode !== 'calculation' && messages.some(message => message.sender === 'bot') && (
                  <InterventionGate
                    intervention={intervention}
                    isLoading={isLoading}
                    onSubmit={handleGateSubmit}
                  />
                )}
                {supportMode !== 'calculation' && (
                  <ChatActions
                    hintCount={hintCount}
                    continueChat={handleContinueChat}
                    getFullAnswer={handleFullAnswer}
                    isLoading={isLoading}
                    isCoolingDown={isCoolingDown}
                    cooldownRemaining={cooldownRemaining}
                    intervention={intervention}
                    showActions={messages.length > 0}
                    showHint
                  />
                )}
              </div>
            </div>
          )}
        </>}
      </section>
    </main>
    <NewChatModal isOpen={isChatSettingsOpen} onClose={() => setIsChatSettingsOpen(false)} onStartChat={handleConfiguredChat} />
    <NewChatModal isOpen={isSubjectPickerOpen} onClose={() => { subjectPickerSeenRef.current = false; setIsSubjectPickerOpen(false); }} onStartChat={settings => { createNewChat(settings); setSettingsSelected(true); subjectPickerSeenRef.current = true; setIsSubjectPickerOpen(false); }} />
  </div>;
};

export default ChatPage;
