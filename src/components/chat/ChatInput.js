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
    <div className="mb-2 sm:mb-3">
      {/* Image preview - More compact on mobile */}
      {selectedImage && (
        <div className="mb-2 sm:mb-3 p-2 sm:p-2.5 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-1 sm:mb-2">
            <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
              {t('chat.image.selected')}: {selectedImage.name}
            </span>
            <button
              onClick={handleImageRemove}
              className="text-red-500 hover:text-red-700 text-xs font-medium px-1.5 py-0.5 rounded touch-target"
            >
              {t('common.remove')}
            </button>
          </div>
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      <div className="flex gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={(e) => {
              // Mobile keyboard handling is done at page level
              // Just ensure the input stays visible without aggressive scrolling
            }}
            placeholder={placeholder}
            disabled={isLoading}
            rows="1"
            className="w-full px-3 py-2 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-gray-200 rounded-2xl sm:rounded-full text-sm resize-none outline-none focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:focus:border-indigo-500 dark:disabled:bg-gray-700"
          />
          
          {/* Image upload button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 p-1.5 sm:p-2 text-gray-500 hover:text-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
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
          className="px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl sm:rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm sm:text-base touch-target"
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
