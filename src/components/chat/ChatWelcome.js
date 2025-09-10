import React from 'react';
import t from '../../locales/i18n';

const ChatWelcome = () => {
  return (
    <div className="text-center text-gray-600 my-10">
      <div className="mb-6">
        <img src="/image/seal-welcome.png" alt="seal" className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow" />
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