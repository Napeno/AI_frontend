import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import t from '../../locales/i18n';
import SettingsModal from '../settings/SettingsModal';

const UserProfile = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const profileRef = useRef(null);

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

  return (
    <>
      <div className="relative" ref={profileRef}>
        {isMenuOpen && (
          <div className="absolute bottom-full left-0 w-full mb-2 bg-gray-800 text-white rounded-lg shadow-lg">
            <div className="p-2">
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                onClick={handleSettingsClick}
              >
                {t('userProfile.settings')}
              </button>
              <button
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 rounded"
                onClick={logout}
              >
                {t('userProfile.logout')}
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-full flex items-center p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-xl">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="ml-3 text-left">
            <p className="font-semibold text-gray-800">{user.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </button>
      </div>
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
    </>
  );
};

export default UserProfile; 