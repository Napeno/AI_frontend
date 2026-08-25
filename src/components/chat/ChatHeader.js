import React from 'react';
import ThinkingBattery from './ThinkingBattery';
import UserProfile from '../sidebar/UserProfile';
import { useTheme } from '../../context/ThemeContext';

const ChatHeader = ({ currentConversationTitle, intervention, onOpenHistory, onOpenSettings }) => {
  const { theme, changeTheme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  return <header className="chat-header relative flex h-16 shrink-0 items-center px-3 sm:px-5">
    <button type="button" onClick={onOpenHistory} aria-label="Mở lịch sử trò chuyện" className="mr-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    <div className="min-w-0 flex-1">
      <p className="chat-kicker hidden text-xs font-semibold uppercase tracking-[0.18em] sm:block">ThinkBridge · góc học cùng sóc</p>
      <p className="truncate text-sm font-semibold sm:text-base">{currentConversationTitle || 'Chat mới'}</p>
    </div>
    {intervention?.riskScore !== undefined && <div className="absolute left-1/2 -translate-x-1/2"><ThinkingBattery level={intervention.batteryLevel} /></div>}
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => changeTheme(isDark ? 'light' : 'dark')} title={isDark ? 'Chuyển light mode' : 'Chuyển dark mode'} aria-label={isDark ? 'Chuyển light mode' : 'Chuyển dark mode'} className="chat-header-button rounded-xl p-2">
        <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      </button>
      <button type="button" onClick={onOpenSettings} title="Thiết lập chat" aria-label="Thiết lập chat" className="chat-header-button rounded-xl p-2">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 22.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM4.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15M4.5 12h15" /></svg>
      </button>
      <div className="md:hidden"><UserProfile compact menuPosition="top-12" menuAlign="right-0" /></div>
    </div>
  </header>;
};

export default ChatHeader;
