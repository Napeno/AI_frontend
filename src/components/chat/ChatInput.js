import React, { useRef } from 'react';
import t from '../../locales/i18n';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  sendMessage, 
  isLoading, 
  handleKeyPress,
  selectedImage,
  setSelectedImage,
  sendImageMessage
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
    if (selectedImage) {
      sendImageMessage(selectedImage, inputMessage);
    } else {
      sendMessage();
    }
  };

  return (
    <div className="mb-3 sm:mb-4">
      {/* Image preview */}
      {selectedImage && (
        <div className="mb-3 p-2.5 sm:p-3 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {t('chat.image.selected')}: {selectedImage.name}
            </span>
            <button
              onClick={handleImageRemove}
              className="text-red-500 hover:text-red-700 text-xs sm:text-sm font-medium px-2 py-1 rounded touch-target"
            >
              {t('common.remove')}
            </button>
          </div>
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
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
              // On mobile, scroll the input into view when keyboard appears
              setTimeout(() => {
                e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }, 300);
            }}
            placeholder={selectedImage ? t('chat.input.placeholderWithImage') : t('chat.input.placeholder')}
            disabled={isLoading}
            rows="1"
            className="w-full px-3 py-2.5 pr-10 sm:px-4 sm:py-3 sm:pr-12 border-2 border-gray-200 rounded-2xl sm:rounded-full text-sm resize-none outline-none focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:focus:border-indigo-500 dark:disabled:bg-gray-700"
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
          disabled={isLoading || (!inputMessage.trim() && !selectedImage)}
          className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-2xl sm:rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none text-sm sm:text-base touch-target"
        >
          <span className="hidden sm:inline">{t('common.send')}</span>
          <span className="sm:hidden">📤</span>
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 