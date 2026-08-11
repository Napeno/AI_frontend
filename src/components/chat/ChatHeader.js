import React from 'react';
import ThinkingBattery from './ThinkingBattery';
import UserProfile from '../sidebar/UserProfile';

const ChatHeader = ({ currentConversationTitle, intervention, onOpenHistory, onOpenSettings, onBackgroundChange, currentBackground }) => (
  <header className="relative flex h-14 shrink-0 items-center border-b border-slate-200 bg-white px-3 dark:border-slate-800 dark:bg-slate-950">
    <button type="button" onClick={onOpenHistory} aria-label="Mở lịch sử trò chuyện" className="mr-2 rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden">
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
    </button>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{currentConversationTitle || 'Chat mới'}</p>
    </div>
    {intervention?.riskScore !== undefined && <div className="absolute left-1/2 -translate-x-1/2"><ThinkingBattery level={intervention.batteryLevel} /></div>}
    <div className="flex items-center gap-1">
      <button type="button" onClick={onOpenSettings} title="Thiết lập chat" aria-label="Thiết lập chat" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-cyan-700 dark:text-slate-400 dark:hover:bg-slate-800">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM19.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM12 22.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM4.5 12a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15M4.5 12h15" /></svg>
      </button>
      <div className="md:hidden"><UserProfile compact menuPosition="top-12" menuAlign="right-0" onBackgroundChange={onBackgroundChange} currentBackground={currentBackground} /></div>
    </div>
  </header>
);

export default ChatHeader;
