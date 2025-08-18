import React from 'react';
import t from '../../locales/i18n';

const ChatWelcome = () => {
  return (
    <div className="text-center text-gray-600 my-10">
      <div className="mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
      </div>
      <p className="text-lg mb-2 font-bold text-gray-900">Ready to learn?</p>
      <p className="text-base mb-4 text-gray-700">Ask a question, get a hint, try your answer, and iterate. I’ll help you think — not just tell you the answer.</p>
      <div className="mx-auto max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-sm font-semibold text-indigo-600">Ask</div>
          <div className="text-sm text-gray-600">Describe the problem and what you tried.</div>
        </div>
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-sm font-semibold text-indigo-600">Hint</div>
          <div className="text-sm text-gray-600">Use Continue for small, step-by-step clues.</div>
        </div>
        <div className="rounded-xl border p-3 bg-white">
          <div className="text-sm font-semibold text-indigo-600">Check</div>
          <div className="text-sm text-gray-600">Submit your attempt to get feedback.</div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcome; 