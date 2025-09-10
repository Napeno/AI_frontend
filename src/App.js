import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import t from './locales/i18n';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LeaderboardPage from './pages/LeaderboardPage';

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
        <div className="w-full p-3 bg-white border-b border-seablue-200 flex items-center justify-between shadow-sm">
          <Link to="/" className="text-lg font-bold text-seablue-600 flex items-center gap-2">
            <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-6 h-6" />
            SealEdu
          </Link>
          <div className="text-sm flex items-center gap-4">
            {token ? (
              <>
                <Link to="/leaderboard" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1">
                  🏆 {t('leaderboard.title')}
                </Link>
                <Link to="/chat" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1">
                  <img src="/image/sealedu-logo.png" alt="Chat Logo" className="w-5 h-5" />
                  Chat
                </Link>
                <span className="mr-2 text-gray-700">{user?.email}</span>
                <button onClick={logout} className="text-seablue-600 hover:text-seablue-700 font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-seablue-600 hover:text-seablue-700 mr-3 font-medium">Login</Link>
                <Link to="/register" className="text-seablue-600 hover:text-seablue-700 font-medium">Register</Link>
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
        <Route path="/leaderboard" element={token ? <LeaderboardPage /> : <Navigate to="/login" replace />} />
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
