import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import t from '../../locales/i18n';
import SettingsModal from '../settings/SettingsModal';
import AvatarShop from '../shop/AvatarShop';
import { get } from '../../utils/apiClient';

const UserProfile = ({ compact = false, menuPosition = 'bottom-0', menuAlign = 'left-12' }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [badges, setBadges] = useState([]);
  const [journal, setJournal] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    Promise.all([get('/user/badges'), get('/user/journal/weekly')])
      .then(async ([badgeResponse, journalResponse]) => {
        if (badgeResponse.ok) setBadges((await badgeResponse.json()).badges || []);
        if (journalResponse.ok) setJournal(await journalResponse.json());
      })
      .catch(() => {});
  }, [isMenuOpen]);

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
            <Link to="/thinking" onClick={closeMenu} className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">📓 Nhật ký tư duy</Link>
            <Link to="/leaderboard" onClick={closeMenu} className="block rounded-lg px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">🏆 {t('leaderboard.title')}</Link>
            <button type="button" onClick={openShop} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">🛍️ Cửa hàng</button>
            <button type="button" onClick={openSettings} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800">⚙️ {t('userProfile.settings')}</button>
            <div className="mt-2 border-t border-slate-100 px-2 pt-3 dark:border-slate-800">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-700 dark:text-orange-300">🌰 Huy hiệu nhà tư duy</p>
              <div className="mt-2 space-y-1">
                {badges.map(badge => <div key={badge.code} className={`rounded-lg px-2 py-1.5 text-xs ${badge.earnedAt ? 'bg-orange-50 text-orange-900 dark:bg-orange-950/50 dark:text-orange-100' : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}><span className="mr-1">{badge.icon}</span>{badge.title}{badge.earnedAt ? ' · Đã mở' : ' · Chưa mở'}</div>)}
              </div>
              {journal && <div className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950 dark:bg-amber-950/40 dark:text-amber-100"><p className="font-bold">📓 Nhật ký tuần</p><p className="mt-1">{journal.message}</p><p className="mt-1 opacity-75">Tự thử trước khi hỏi: {journal.current.beforeHint}/{journal.current.activities} bài</p></div>}
            </div>
          </div>
          <button type="button" onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">🚪 {t('userProfile.logout')}</button>
        </div>
      )}
      <button type="button" onClick={() => setIsMenuOpen(value => !value)} aria-label="Mở menu tài khoản" aria-expanded={isMenuOpen} className={compact ? 'flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-lg hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900' : 'rounded-lg p-2'}>
        <img src="/avatar.png" alt="Avatar người dùng" className="h-8 w-8 object-contain" />
      </button>
    </div>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
    <AvatarShop isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
  </>;
};

export default UserProfile;
