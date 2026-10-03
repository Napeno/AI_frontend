import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import t from '../../locales/i18n';
import SettingsModal from '../settings/SettingsModal';
import AvatarShop from '../shop/AvatarShop';
import { get } from '../../utils/apiClient';

const UserProfile = ({ compact = false, dense = false, menuPosition = 'bottom-0', menuAlign = 'left-12' }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [journal, setJournal] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const close = event => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsMenuOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    get('/user/journal/weekly')
      .then(async response => { if (response.ok) setJournal(await response.json()); })
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
              {journal && <Link to="/thinking" onClick={closeMenu} className="mt-3 block rounded-lg bg-amber-50 p-2 text-xs text-amber-950 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"><p className="flex items-center gap-1 font-bold"><span aria-hidden="true">🏅</span> Mục tiêu tuần tiếp theo</p><p className="mt-1 font-semibold">{journal.goal?.title}</p><p className="mt-1">{journal.goal?.description}</p><p className="mt-1 opacity-75">Tiến độ: {journal.goal?.progress}/{journal.goal?.target} {journal.goal?.unit}</p></Link>}
              {journal?.badges?.length > 0 && <Link to="/thinking" onClick={closeMenu} className="mt-2 block rounded-lg bg-orange-50 p-2 text-xs text-orange-900 hover:bg-orange-100 dark:bg-orange-950/40 dark:text-orange-100 dark:hover:bg-orange-950/60"><p className="font-bold">🏅 Huy hiệu nhà tư duy</p><div className="mt-1 space-y-1">{journal.badges.map(badge => <p key={badge.code} className={badge.earnedAt ? '' : 'opacity-50'}>🏅 {badge.title} · {badge.earnedAt ? 'Đã mở' : 'Chưa mở'}</p>)}</div></Link>}
            </div>
          </div>
          <button type="button" onClick={logout} className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">🚪 {t('userProfile.logout')}</button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsMenuOpen(value => !value)}
        aria-label="Mở menu tài khoản"
        aria-expanded={isMenuOpen}
        className={
          compact
            ? `flex items-center justify-center rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-950 dark:hover:bg-orange-900 ${dense ? 'h-8 w-8' : 'h-10 w-10 text-lg'}`
            : 'rounded-lg p-2'
        }
      >
        <img src="/studentAI.png" alt="Avatar người dùng" className={dense ? 'h-6 w-6 object-contain' : 'h-8 w-8 object-contain'} />
      </button>
    </div>
    <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} activeTab={activeTab} setActiveTab={setActiveTab} />
    <AvatarShop isOpen={isShopOpen} onClose={() => setIsShopOpen(false)} />
  </>;
};

export default UserProfile;
