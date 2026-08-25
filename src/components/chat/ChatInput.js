import React, { useRef } from 'react';
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
  onFocus,
}) => {
  const fileInputRef = useRef(null);

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSend = () => {
    if (typeof onSend === 'function') {
      onSend();
    }
  };

  const trimmedInput = (inputMessage || '').trim();
  const sendDisabled = isLoading || isCoolingDown || (!trimmedInput && !selectedImage);
  const buttonTitle = isCoolingDown
    ? t('chat.cooldown.tooltip', { seconds: cooldownRemaining })
    : undefined;
  const buttonLabelDesktop = isCoolingDown
    ? t('chat.cooldown.button', { seconds: cooldownRemaining })
    : t('common.send');
  const buttonLabelMobile = isCoolingDown
    ? `${cooldownRemaining}s`
    : '📤';
  const placeholder = supportMode === 'calculation'
    ? t('chat.input.workPlaceholder')
    : selectedImage
      ? t('chat.input.placeholderWithImage')
      : t('chat.input.placeholder');

  return (
    <div className="mb-2">
      {/* Image preview - More compact on mobile */}
      {selectedImage && (
        <div className="chat-image-preview mb-2 rounded-xl p-2 sm:mb-3 sm:p-2.5">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="chat-muted truncate text-xs">
              {t('chat.image.selected')}: {selectedImage.name}
            </span>
            <button
              onClick={handleImageRemove}
              className="text-red-500 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded touch-target"
            >
              {t('common.remove')}
            </button>
          </div>
          <div className="chat-image-thumb h-16 w-16 overflow-hidden rounded-lg sm:h-24 sm:w-24">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="chat-input-shell flex items-end gap-2 rounded-2xl p-2 shadow-sm">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={(e) => {
              onFocus?.(e);
              // Mobile keyboard handling is done at page level
              // Just ensure the input stays visible without aggressive scrolling
            }}
            onClick={onFocus}
            placeholder={placeholder}
            disabled={isLoading}
            rows="1"
            className="chat-input w-full resize-none bg-transparent px-2 py-2 pr-10 text-sm outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
          
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="chat-icon-button absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 disabled:opacity-50"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
        </div>
        
        <button 
          onClick={handleSend} 
          disabled={sendDisabled}
          title={buttonTitle}
          className="chat-send rounded-xl px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="hidden sm:inline">{buttonLabelDesktop}</span>
          <span className="sm:hidden">{buttonLabelMobile}</span>
        </button>
      </div>

      {isCoolingDown && (
        <div className="mt-1 sm:mt-2 text-right text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          {t('chat.cooldown.helper', { seconds: cooldownRemaining })}
        </div>
      )}
    </div>
  );
};

export default ChatInput; 
