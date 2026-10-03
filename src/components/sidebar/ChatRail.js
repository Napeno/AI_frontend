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
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 4.5H7A2.5 2.5 0 004.5 7v10A2.5 2.5 0 007 19.5h10a2.5 2.5 0 002.5-2.5v-5.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.6 4.2a1.6 1.6 0 012.26 2.26L10.5 13.8 8 14.5l.7-2.5 6.9-7.8z" />
      </svg>
    </RailButton>
    <RailButton label="Lịch sử trò chuyện" onClick={onOpenHistory}>
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    </RailButton>
    <Link to="/practice" title="Sổ tay lỗi" aria-label="Sổ tay lỗi" className="chat-rail-button flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors">
      <span aria-hidden="true">📘</span>
    </Link>
    <Link to="/ai-tutor/library" title="Luyện tập cùng AI Tutor" aria-label="Luyện tập cùng AI Tutor" className="chat-rail-button flex h-10 w-10 items-center justify-center rounded-xl transition-colors">
      <span className="text-lg" aria-hidden="true">📚</span>
    </Link>
    <Link to="/thinking" title="Nhật ký tư duy" aria-label="Nhật ký tư duy" className="chat-rail-button flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-colors">
      <span aria-hidden="true">📓</span>
    </Link>
    <div className="mt-auto">
      <UserProfile compact coinAnimationTrigger={coinAnimationTrigger} pointsAnimationTrigger={pointsAnimationTrigger} />
    </div>
  </aside>
);

export default ChatRail;
