import React from 'react';

const Welcome = ({ children }) => (
  <div className="flex h-full flex-col items-center justify-center px-4 text-center">
    <div className="w-full max-w-3xl -translate-y-8">
      <img src="/image/sealedu-logo.png" alt="" className="mx-auto mb-4 h-12 w-12" />
      <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">Hôm nay bạn muốn học gì?</h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Đặt câu hỏi hoặc gửi ảnh bài tập để ThinkBridge cùng bạn bắt đầu.</p>
      <div className="mt-6">{children}</div>
    </div>
  </div>
);

export default Welcome;
