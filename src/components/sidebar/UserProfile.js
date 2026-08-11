import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import t from '../../locales/i18n';
import SettingsModal from '../settings/SettingsModal';
import AvatarShop from '../shop/AvatarShop';
import BackgroundSelector from '../ui/BackgroundSelector';
import { AVATAR_EMOJIS } from '../../utils/avatarUtils';

const UserProfile = ({ compact = false, menuPosition = 'bottom-0', menuAlign = 'left-12', onBackgroundChange, currentBackground }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const menuRef = useRef(null);
  const avatar = AVATAR_EMOJIS[user?.avatar || 'default'] || '👤';

  useEffect(() => {
    const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  if (!user) return null;

  const closeMenu = () => setIsMenuOpen(false);
  const openSettings = () => { setActiveTab('general'); setIsSettingsOpen(true); closeMenu(); };
  const openShop = () => { setIsShopOpen(true); closeMenu(); };

  return <>
    <div className="relative" ref={menuRef}>
      {isMenuOpen && (
        <div className={`absolute ${menuPosition} ${menuAlign} z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900`}>
          <div className="border-b border-slate-100 px-2 pb-2 dark:border-slate-800">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{user.name || user.username}</p>
            <p className="mt-1 text-xs text-slate-500">🌰 {(user.chestnuts || 0).toLocaleString()} · {user.points || 0} điểm</p>
          </div>
          <div className="py-1 text-sm">
            <Link to="/practice" onClick={closeMenu} className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">📘 Ôn tập</Link>
            <Link to="/leaderboard" onClick={closeMenu} className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">🏆 {t('leaderboard.title')}</Link>
            <button type="button" onClick={openShop} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">🛍️ Cửa hàng</button>
            <button type="button" onClick={openSettings} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">⚙️ {t('userProfile.settings')}</button>
            {onBackgroundChange && <div className="px-1 py-1"><BackgroundSelector onBackgroundChange={onBackgroundChange} currentBackground={currentBackground} compact /></div>}
          </div>
          <button type="button" onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">🚪 {t('userProfile.logout')}</button>
        </div>
      )}
      <button type="button" onClick={() => setIsMenuOpen(value => !value)} aria-label="Mở menu tài khoản" aria-expanded={isMenuOpen} className={compact ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-lg hover:bg-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-900' : 'rounded-lg p-2'}>
        {avatar}
      </button>
    </div>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
    <AvatarShop isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
  </>;
};

export default UserProfile;
