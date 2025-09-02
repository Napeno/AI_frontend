import React, { useState, useRef } from 'react';
import t from '../../locales/i18n';

const ChatInput = ({ 
  inputMessage, 
  setInputMessage, 
  sendMessage, 
  isLoading, 
  handleKeyPress,
  selectedImages,
  setSelectedImages
}) => {
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      alert('Some files were not added. Only JPEG, PNG, GIF, WebP images under 5MB are allowed.');
    }

    setSelectedImages(prevImages => [...prevImages, ...validFiles]);
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index) => {
    setSelectedImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSend = () => {
    if ((inputMessage.trim() || selectedImages.length > 0) && !isLoading) {
      sendMessage();
    }
  };

  const handleKeyPressWithImages = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-3 mb-4">
      {/* Image Previews */}
      {selectedImages.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
          {selectedImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
              >
                ×
              </button>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-3">
        {/* Image Upload Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-shrink-0 p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          title="Upload Images"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Text Input */}
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPressWithImages}
          placeholder={selectedImages.length > 0 ? t('chat.input.placeholderWithImage') || 'Ask something about the images...' : t('chat.input.placeholder')}
          disabled={isLoading}
          rows="1"
          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-full text-sm resize-none outline-none focus:border-indigo-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />

        {/* Send Button */}
        <button 
          onClick={handleSend} 
          disabled={isLoading || (!inputMessage.trim() && selectedImages.length === 0)}
          className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            t('common.send')
          )}
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />
    </div>
  );
};

export default ChatInput; 