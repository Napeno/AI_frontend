import React from 'react';
import { Link } from 'react-router-dom';
import UserProfile from './UserProfile';

const RailButton = ({ label, onClick, children }) => (
  <button type="button" onClick={onClick} title={label} aria-label={label} className="chat-rail-button flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
    {children}
  </button>
);

const ChatRail = ({ onNewChat, onOpenHistory, coinAnimationTrigger, pointsAnimationTrigger }) => (
  <aside className="chat-rail hidden h-full w-16 shrink-0 flex-col items-center py-3 md:flex">
    <Link to="/" title="ThinkBridge" aria-label="ThinkBridge" className="chat-brand mb-5 flex h-10 w-10 items-center justify-center rounded-xl">
      <img src="/avatar.png" alt="ThinkBridge squirrel" className="h-8 w-8 object-contain" />
    </Link>
    <RailButton label="Tạo chat mới" onClick={onNewChat}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
    </RailButton>
    <RailButton label="Lịch sử trò chuyện" onClick={onOpenHistory}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </RailButton>
    <Link to="/ai-tutor/library" title="Luyện tập cùng AI Tutor" aria-label="Luyện tập cùng AI Tutor" className="chat-rail-button flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
      <span className="text-lg" aria-hidden="true">📚</span>
    </Link>
    <div className="mt-auto">
      <UserProfile compact coinAnimationTrigger={coinAnimationTrigger} pointsAnimationTrigger={pointsAnimationTrigger} />
    </div>
  </aside>
);

export default ChatRail;
