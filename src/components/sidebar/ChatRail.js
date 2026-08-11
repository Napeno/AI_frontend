import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile';

const RailButton = ({ label, onClick, children }) => (
  <button type="button" onClick={onClick} title={label} aria-label={label} className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-cyan-50 hover:text-cyan-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-cyan-300">
    {children}
  </button>
);

const ChatRail = ({ onNewChat, onOpenHistory, coinAnimationTrigger, pointsAnimationTrigger, onBackgroundChange, currentBackground }) => (
  <aside className="hidden h-full w-14 shrink-0 flex-col items-center border-r border-slate-200 bg-white py-2 dark:border-slate-800 dark:bg-slate-950 md:flex">
    <Link to="/" title="ThinkBridge" aria-label="ThinkBridge" className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg hover:bg-cyan-50 dark:hover:bg-slate-800">
      <img src="/image/sealedu-logo.png" alt="" className="h-7 w-7" />
    </Link>
    <RailButton label="Tạo chat mới" onClick={onNewChat}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    </RailButton>
    <RailButton label="Lịch sử trò chuyện" onClick={onOpenHistory}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </RailButton>
    <div className="mt-auto">
      <UserProfile compact coinAnimationTrigger={coinAnimationTrigger} pointsAnimationTrigger={pointsAnimationTrigger} onBackgroundChange={onBackgroundChange} currentBackground={currentBackground} />
    </div>
  </aside>
);

export default ChatRail;
