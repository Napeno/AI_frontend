import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const AppContent = () => {
  const { token, user, logout } = useAuth();
  const location = useLocation();
  
  // Check if current page is chat page
  const isChatPage = location.pathname === '/chat';

  // Toggle chat-page class on body
  useEffect(() => {
    if (isChatPage) {
      document.body.classList.add('chat-page');
    } else {
      document.body.classList.remove('chat-page');
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('chat-page');
    };
  }, [isChatPage]);

  return (
    <div className={isChatPage ? "h-screen w-full" : "w-full"}>
      {/* Show navigation bar only for non-chat pages */}
      {!isChatPage && (
        <div className="w-full p-3 bg-white border-b border-gray-200 flex items-center justify-between">
          <Link to="/" className="text-sm font-semibold text-indigo-600">AI Chatbot</Link>
          <div className="text-sm">
            {token ? (
              <>
                <span className="mr-2 text-gray-700">{user?.email}</span>
                <button onClick={logout} className="text-indigo-600">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-indigo-600 mr-3">Login</Link>
                <Link to="/register" className="text-indigo-600">Register</Link>
              </>
            )}
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={token ? <Navigate to="/chat" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/chat" replace /> : <RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/chat" element={token ? <ChatPage /> : <Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
