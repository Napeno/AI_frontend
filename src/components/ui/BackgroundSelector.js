import React, { useState, useEffect } from 'react';
import t from '../../locales/i18n';

const BackgroundSelector = ({ onBackgroundChange, currentBackground }) => {
  const [backgrounds, setBackgrounds] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load all background images with proper names and regions
    const backgroundList = [
      { id: 'default', name: 'Mặc định', region: 'ThinkBridge', path: '/background/default.jpeg' },
      { id: 1, name: 'Đại dương xanh', region: 'Biển Đông', path: '/background/bg_1.jpeg' },
      { id: 2, name: 'Rạn san hô', region: 'Nha Trang', path: '/background/bg_2.jpeg' },
      { id: 3, name: 'Bãi biển nhiệt đới', region: 'Phú Quốc', path: '/background/bg_3.jpeg' },
      { id: 4, name: 'Đảo xanh', region: 'Cát Bà', path: '/background/bg_4.jpeg' },
      { id: 5, name: 'Vịnh đẹp', region: 'Hạ Long', path: '/background/bg_5.jpeg' },
      { id: 6, name: 'Biển sâu', region: 'Biển Đông', path: '/background/bg_6.jpeg' },
      { id: 7, name: 'Hoàng hôn biển', region: 'Mũi Né', path: '/background/bg_7.jpeg' },
      { id: 8, name: 'Thế giới dưới nước', region: 'Rạn san hô', path: '/background/bg_8.jpeg' },
      { id: 9, name: 'Bãi cát trắng', region: 'Đảo Lý Sơn', path: '/background/bg_9.jpeg' },
      { id: 11, name: 'Vùng biển trong xanh', region: 'Côn Đảo', path: '/background/bg_11.jpeg' },
      { id: 12, name: 'Thiên đường biển', region: 'Bình Thuận', path: '/background/bg_12.jpeg' }
    ];
    setBackgrounds(backgroundList);
  }, []);

  const handleBackgroundSelect = (background) => {
    onBackgroundChange(background);
    setIsOpen(false);
  };

  const clearBackground = () => {
    onBackgroundChange(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 text-seablue-600 dark:text-gray-300 bg-gradient-to-r from-seablue-50 to-seablue-100 dark:from-gray-700 dark:to-gray-600 hover:shadow-md dark:hover:bg-gray-700 rounded-lg transition-colors"
        title={t('background.changeBackground')}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-sm font-medium hidden sm:inline">{t('background.themeBackground')}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-seablue-200 dark:border-gray-700 z-50 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
<h3 className="font-semibold text-gray-800 dark:text-gray-200">{t('background.title')}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Default/Clear option */}
              {/* <div
                onClick={clearBackground}
                className={`rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                  !currentBackground 
                    ? 'border-seablue-500 ring-2 ring-seablue-200' 
                    : 'border-gray-200 dark:border-gray-600 hover:border-seablue-300'
                } bg-gradient-to-br from-seablue-50 to-seablue-100 dark:from-gray-700 dark:to-gray-600 p-3`}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">🦭</div>
<div className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('background.default')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">ThinkBridge Theme</div>
                </div>
              </div> */}

              {/* Background options */}
              {backgrounds.map((bg) => (
                <div
                  key={bg.id}
                  onClick={() => handleBackgroundSelect(bg)}
                  className={`rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                    currentBackground?.id === bg.id 
                      ? 'border-seablue-500 ring-2 ring-seablue-200' 
                      : 'border-gray-200 dark:border-gray-600 hover:border-seablue-300'
                  } overflow-hidden`}
                >
                  <div className="aspect-video relative">
                    <img
                      src={bg.path}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 text-xs"
                      style={{ display: 'none' }}
                    >
                      {bg.name}
                    </div>
                  </div>
                  <div className="p-2">
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {bg.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      📍 {bg.region}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
{t('background.selectBackground')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundSelector;