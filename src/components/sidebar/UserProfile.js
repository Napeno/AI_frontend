import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import t from '../../locales/i18n';
import SettingsModal from '../settings/SettingsModal';
import CoinDisplay from '../ui/CoinDisplay';
import RankDisplay from '../ui/RankDisplay';
import AvatarShop from '../shop/AvatarShop';

const UserProfile = ({ coinAnimationTrigger }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const profileRef = useRef(null);

  // Get avatar emoji
  const AVATAR_EMOJIS = {
    default: '👤',
    student: '🧑‍🎓',
    teacher: '👩‍🏫',
    scientist: '🧑‍🔬',
    artist: '🧑‍🎨',
    engineer: '👷',
    astronaut: '🧑‍🚀',
    detective: '🕵️',
    ninja: '🥷',
    wizard: '🧙‍♂️',
    crown: '👑',
    unicorn: '🦄',
  };

  const currentAvatarEmoji = AVATAR_EMOJIS[user?.avatar || 'default'] || '👤';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const handleSettingsClick = () => {
    setActiveTab('general');
    setIsSettingsOpen(true);
    setIsMenuOpen(false);
  };

  const handleShopClick = () => {
    setIsShopOpen(true);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Rank Display */}
      <div className="mb-3">
        <RankDisplay showProgress={true} size="medium" />
      </div>

      {/* Coin Display & Shop Button */}
      <div className="mb-3 flex justify-between items-center">
        <CoinDisplay coinAnimationTrigger={coinAnimationTrigger} />
        <button
          onClick={handleShopClick}
          className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
          title="Cửa hàng Avatar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
        </button>
      </div>

      <div className="relative" ref={profileRef}>
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg shadow-lg">
            <div className="p-2">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                onClick={handleShopClick}
              >
                🛒 Cửa hàng
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                onClick={handleSettingsClick}
              >
                ⚙️ {t('userProfile.settings')}
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 dark:hover:bg-gray-600 rounded flex items-center gap-2"
                onClick={logout}
              >
                🚪 {t('userProfile.logout')}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentAvatarEmoji}
          </div>
          <div className="ml-3 text-left">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
        </button>
      </div>
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      <AvatarShop
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
      />
    </>
  );
};

export default UserProfile; 