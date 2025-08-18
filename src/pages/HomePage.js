import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { token } = useAuth();
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-white/90 backdrop-blur rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">AI Chatbot for Students</h1>
          <p className="mt-2 text-gray-600">Practice, get hints, and check your answers. Learn by doing — not just reading.</p>

          <div className="mt-6 inline-flex items-center justify-center gap-3">
            {!token && (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2.5 rounded-lg bg-white text-indigo-700 border border-indigo-200 font-medium shadow hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                >
                  Register
                </Link>
              </>
            )}
            {token && (
              <Link
                to="/chat"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 text-white font-medium shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                Open Chat
              </Link>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border bg-white">
            <div className="text-indigo-600 font-semibold mb-1">Step 1</div>
            <div className="text-gray-800 font-bold">Ask your question</div>
            <p className="text-sm text-gray-600 mt-1">Describe the problem clearly. Include what you tried.</p>
          </div>
          <div className="p-4 rounded-xl border bg-white">
            <div className="text-indigo-600 font-semibold mb-1">Step 2</div>
            <div className="text-gray-800 font-bold">Get hints, not answers</div>
            <p className="text-sm text-gray-600 mt-1">Use Continue to get step-by-step hints that guide your thinking.</p>
          </div>
          <div className="p-4 rounded-xl border bg-white">
            <div className="text-indigo-600 font-semibold mb-1">Step 3</div>
            <div className="text-gray-800 font-bold">Check your work</div>
            <p className="text-sm text-gray-600 mt-1">Submit your attempt and get feedback and suggestions.</p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-gray-500">Built for learners. Be curious. Experiment. Improve daily.</div>
      </div>
    </div>
  );
};

export default HomePage; 