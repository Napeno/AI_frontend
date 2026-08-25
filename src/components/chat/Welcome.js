import React from 'react';

const Welcome = ({ children }) => (
  <div className="chat-welcome flex h-full flex-col items-center justify-center px-4 text-center">
    <div className="w-full max-w-3xl -translate-y-8">
      <img src="/image/squirrel-mascot.svg" alt="Sóc ThinkBridge" className="chat-welcome-mascot mx-auto mb-4 h-20 w-20" />
      <p className="chat-kicker text-xs font-bold uppercase tracking-[0.2em]">Góc học cùng sóc</p>
      <h1 className="mt-2 text-xl font-bold sm:text-2xl">Hôm nay bạn muốn học gì?</h1>
      <p className="mt-2 text-sm">Đặt câu hỏi hoặc gửi ảnh bài tập để ThinkBridge cùng bạn bắt đầu.</p>
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export default Welcome;
