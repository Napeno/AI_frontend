import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ThinkingBattery from './ThinkingBattery';
import UserProfile from '../sidebar/UserProfile';
import { useTheme } from '../../context/ThemeContext';
import t from '../../locales/i18n';

const HeaderIconButton = ({ onClick, title, children, className = '', to }) => {
  const classes = `chat-header-button inline-flex h-9 w-9 items-center justify-center rounded-full ${className}`;
  if (to) {
    return <Link to={to} title={title} aria-label={title} className={classes}>{children}</Link>;
  }
  return (
    <button type="button" onClick={onClick} title={title} aria-label={title} className={classes}>
      {children}
    </button>
  );
};

const ChatHeader = ({
  currentConversationTitle,
  intervention,
  onOpenHistory,
  onOpenSettings,
  onNewChat,
}) => {
  const { theme, changeTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const close = (event) => {
      if (moreRef.current && !moreRef.current.contains(event.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <header className="chat-header relative flex h-12 shrink-0 items-center gap-1 px-1.5 sm:h-16 sm:gap-2 sm:px-5">
      <HeaderIconButton onClick={onOpenHistory} title="Mở lịch sử trò chuyện" className="md:hidden">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
        </svg>
      </HeaderIconButton>

      <div className="min-w-0 flex-1 sm:flex-1">
        <p className="chat-kicker hidden text-xs font-semibold uppercase tracking-[0.18em] sm:block">
          ThinkBridge · góc học cùng sóc
        </p>
        <p className="truncate text-[15px] font-semibold tracking-tight sm:text-base">
          {currentConversationTitle || 'ThinkBridge'}
        </p>
      </div>

      <div className="hidden sm:block">
        <ThinkingBattery level={intervention?.batteryLevel ?? 100} compact />
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        <HeaderIconButton
          onClick={onNewChat}
          title={t('chat.input.newChat')}
          className="text-slate-700 dark:text-slate-200"
        >
          {/* ChatGPT-style compose: square + pencil */}
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5H7A2.5 2.5 0 004.5 7v10A2.5 2.5 0 007 19.5h10a2.5 2.5 0 002.5-2.5v-5.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.6 4.2a1.6 1.6 0 012.26 2.26L10.5 13.8 8 14.5l.7-2.5 6.9-7.8z" />
          </svg>
        </HeaderIconButton>

        <HeaderIconButton onClick={onOpenSettings} title="Thiết lập chat" className="hidden sm:inline-flex">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </HeaderIconButton>

        <HeaderIconButton to="/shop" title="Cửa hàng" className="hidden sm:inline-flex text-base">
          🛍️
        </HeaderIconButton>

        <div className="relative md:hidden" ref={moreRef}>
          <HeaderIconButton
            onClick={() => setMoreOpen(value => !value)}
            title="Thêm"
            className="text-slate-700 dark:text-slate-200"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="12" cy="19" r="1.6" />
            </svg>
          </HeaderIconButton>
          {moreOpen && (
            <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-2 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
                <p className="text-[11px] font-medium text-slate-500">Năng lượng tư duy</p>
                <div className="mt-1">
                  <ThinkingBattery level={intervention?.batteryLevel ?? 100} compact />
                </div>
              </div>
              <button
                type="button"
                onClick={() => { changeTheme(isDark ? 'light' : 'dark'); setMoreOpen(false); }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {isDark ? '☀️ Light mode' : '🌙 Dark mode'}
              </button>
              <button
                type="button"
                onClick={() => { onOpenSettings?.(); setMoreOpen(false); }}
                className="block w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ⚙️ Thiết lập chat
              </button>
              <Link
                to="/shop"
                onClick={() => setMoreOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                🛍️ Cửa hàng
              </Link>
              <Link
                to="/practice"
                onClick={() => setMoreOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                📘 Ôn tập
              </Link>
              <div className="mt-1 border-t border-slate-100 px-1 pt-1 dark:border-slate-800">
                <UserProfile compact dense menuPosition="bottom-full" menuAlign="right-0" />
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block">
          <UserProfile compact menuPosition="top-12" menuAlign="right-0" />
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
