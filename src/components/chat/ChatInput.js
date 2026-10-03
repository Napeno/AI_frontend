import React, { useEffect, useRef, useState } from 'react';
import t from '../../locales/i18n';

const ChatInput = ({
  inputMessage,
  setInputMessage,
  isLoading,
  isCoolingDown,
  cooldownRemaining,
  onSend,
  handleKeyPress,
  selectedImage,
  setSelectedImage,
  supportMode,
  canCheckAnswer = false,
  composerIntent = 'chat',
  onComposerIntentChange,
  answerValue = '',
  setAnswerValue,
  onSendAnswer,
  onOpenSubjectPicker,
}) => {
  const fileInputRef = useRef(null);
  const toolsRef = useRef(null);
  const [toolsOpen, setToolsOpen] = useState(false);
  const answerMode = canCheckAnswer && composerIntent === 'answer';

  useEffect(() => {
    const close = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target)) setToolsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      setToolsOpen(false);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const switchIntent = (nextIntent) => {
    if (!onComposerIntentChange || nextIntent === composerIntent) return;
    if (nextIntent === 'chat') {
      if (!(inputMessage || '').trim() && (answerValue || '').trim()) setInputMessage?.(answerValue);
    } else if (!(answerValue || '').trim() && (inputMessage || '').trim()) {
      setAnswerValue?.(inputMessage);
    }
    onComposerIntentChange(nextIntent);
    setToolsOpen(false);
  };

  const value = answerMode ? answerValue : inputMessage;
  const setValue = answerMode ? setAnswerValue : setInputMessage;
  const handleSend = () => (answerMode ? onSendAnswer?.() : onSend?.());
  const trimmedInput = (value || '').trim();
  const sendDisabled = isLoading || isCoolingDown || (!trimmedInput && !selectedImage);
  const buttonTitle = isCoolingDown
    ? t('chat.cooldown.tooltip', { seconds: cooldownRemaining })
    : undefined;
  const placeholder = answerMode
    ? t('chat.input.answerPlaceholder')
    : canCheckAnswer
      ? t('chat.input.chatPlaceholder')
      : supportMode === 'calculation'
        ? t('chat.input.workPlaceholder')
        : selectedImage
          ? t('chat.input.placeholderWithImage')
          : t('chat.input.askPlaceholder');

  return (
    <div className="chat-input-wrap mb-0 sm:mb-2">
      {/* Desktop / tablet mode tabs */}
      {canCheckAnswer && (
        <div className="mb-2 hidden sm:block">
          <div className="chat-composer-mode inline-flex rounded-full border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-600 dark:bg-slate-800" role="tablist">
            <button type="button" role="tab" aria-selected={composerIntent === 'answer'} onClick={() => switchIntent('answer')} disabled={isLoading} className={`rounded-full px-3 py-1 text-xs font-semibold ${composerIntent === 'answer' ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-200'}`}>
              {t('chat.input.modeCheck')}
            </button>
            <button type="button" role="tab" aria-selected={composerIntent === 'chat'} onClick={() => switchIntent('chat')} disabled={isLoading} className={`rounded-full px-3 py-1 text-xs font-semibold ${composerIntent === 'chat' ? 'bg-sky-600 text-white' : 'text-slate-600 dark:text-slate-200'}`}>
              {t('chat.input.modeChat')}
            </button>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('chat.input.modeHint')}</p>
        </div>
      )}

      {/* Mobile: only Check / Chat mode */}
      {canCheckAnswer && (
        <div className="chat-mobile-quickbar mb-2 flex items-center gap-2 overflow-x-auto pb-0.5 sm:hidden">
          <button type="button" onClick={() => switchIntent('answer')} className={`chat-quick-chip shrink-0 ${answerMode ? 'is-active-check' : ''}`}>
            {t('chat.input.modeCheckShort')}
          </button>
          <button type="button" onClick={() => switchIntent('chat')} className={`chat-quick-chip shrink-0 ${!answerMode ? 'is-active-chat' : ''}`}>
            {t('chat.input.modeChatShort')}
          </button>
        </div>
      )}

      {selectedImage && (
        <div className="chat-image-preview mb-2 flex items-center gap-2 rounded-2xl p-2 sm:mb-3 sm:p-2.5">
          <div className="chat-image-thumb h-12 w-12 overflow-hidden rounded-xl sm:h-24 sm:w-24">
            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="h-full w-full object-cover" />
          </div>
          <span className="chat-muted min-w-0 flex-1 truncate text-sm">{selectedImage.name}</span>
          <button onClick={handleImageRemove} className="text-sm font-medium text-red-500">{t('common.remove')}</button>
        </div>
      )}

      <div
        className={`chat-input-shell chat-input-pill flex items-end gap-2 sm:items-center sm:gap-2 sm:rounded-2xl sm:p-2 ${
          answerMode ? 'chat-input-shell-answer' : canCheckAnswer ? 'chat-input-shell-chat' : ''
        }`}
      >
        <div className="relative shrink-0" ref={toolsRef}>
          <button
            type="button"
            onClick={() => setToolsOpen(value => !value)}
            disabled={isLoading}
            className="chat-plus-button inline-flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-50 sm:h-9 sm:w-9"
            title={t('chat.input.tools')}
            aria-label={t('chat.input.tools')}
          >
            <svg className="h-6 w-6 sm:h-5 sm:w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
          </button>
          {toolsOpen && (
            <div className="absolute bottom-14 left-0 z-40 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900 sm:bottom-11 sm:w-52 sm:p-1.5">
              <button type="button" onClick={() => fileInputRef.current?.click()} className="block w-full rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800 sm:py-2 sm:text-sm">
                🖼️ {t('chat.input.addImage')}
              </button>
              {canCheckAnswer && (
                <>
                  <button type="button" onClick={() => switchIntent('answer')} className="block w-full rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800 sm:py-2 sm:text-sm">
                    ✨ {t('chat.input.modeCheck')}
                  </button>
                  <button type="button" onClick={() => switchIntent('chat')} className="block w-full rounded-xl px-3 py-2.5 text-left text-[15px] hover:bg-slate-100 dark:hover:bg-slate-800 sm:py-2 sm:text-sm">
                    💬 {t('chat.input.modeChat')}
                  </button>
                </>
              )}
            </div>
          )}
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
        </div>

        <textarea
          value={value}
          onChange={(e) => setValue?.(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={isLoading}
          rows="1"
          className="chat-input min-h-[44px] max-h-36 flex-1 resize-none bg-transparent px-1 py-2.5 text-[16px] leading-6 outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[36px] sm:px-2 sm:py-2 sm:text-sm sm:leading-5"
        />

        <button
          onClick={handleSend}
          disabled={sendDisabled}
          title={buttonTitle}
          className={`chat-send chat-send-round shrink-0 disabled:cursor-not-allowed disabled:opacity-40 ${
            answerMode ? 'chat-send-answer' : canCheckAnswer && !answerMode ? 'chat-send-ask' : ''
          }`}
        >
          {isCoolingDown ? (
            <span className="text-xs font-bold">{cooldownRemaining}s</span>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </button>
      </div>

      {onOpenSubjectPicker && (
        <button type="button" onClick={onOpenSubjectPicker} className="mt-2 inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
          📚 Chọn môn học
        </button>
      )}

      {isCoolingDown && (
        <div className="mt-1 hidden text-right text-xs text-gray-500 dark:text-gray-400 sm:block">
          {t('chat.cooldown.helper', { seconds: cooldownRemaining })}
        </div>
      )}
    </div>
  );
};

export default ChatInput;
