import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import t from './locales/i18n';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
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
        <div className="w-full p-3 sm:p-4 bg-white border-b border-seablue-200 flex items-center justify-between shadow-sm">
          <Link to="/" className="text-lg sm:text-xl font-bold text-seablue-600 flex items-center gap-2">
            <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="hidden xs:inline">SealEdu</span>
            <span className="xs:hidden">SE</span>
          </Link>
          <div className="text-xs sm:text-sm flex items-center gap-2 sm:gap-4">
            {token ? (
              <>
                <Link to="/leaderboard" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">
                  <span className="text-sm">🏆</span>
                  <span className="hidden sm:inline">{t('leaderboard.title')}</span>
                </Link>
                <Link to="/chat" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">
                  <img src="/image/sealedu-logo.png" alt="Chat Logo" className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>
                <div className="hidden md:flex items-center gap-2">
                  <span className="text-gray-700 text-xs">{user?.username}</span>
                  <button onClick={logout} className="text-seablue-600 hover:text-seablue-700 font-medium px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">Logout</button>
                </div>
                <div className="md:hidden">
                  <button onClick={logout} className="text-seablue-600 hover:text-seablue-700 font-medium px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors text-xs">
                    👋
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-seablue-600 hover:text-seablue-700 font-medium px-3 py-1.5 rounded-lg hover:bg-seablue-50 transition-colors">Login</Link>
                <Link to="/register" className="bg-seablue-gradient text-white font-medium px-3 py-1.5 rounded-lg hover:shadow-md transition-all duration-200">Register</Link>
              </>
            )}
          </div>
        </div>
      )}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={token ? <Navigate to="/chat" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/chat" replace /> : <RegisterPage />} />
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
