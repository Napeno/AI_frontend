import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import { setNavigate } from './utils/apiClient';
import t from './locales/i18n';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import LeaderboardPage from './pages/LeaderboardPage';
import GameHomePage from './pages/GameHomePage';
import QuizGamePage from './pages/QuizGamePage';
import PracticePage from './pages/PracticePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ThinkingJournalPage from './pages/ThinkingJournalPage';
import AITutorPage from './pages/AITutorPage';

const AppContent = () => {
  const { token, user, authReady, logout } = useAuth();
  const { theme, changeTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin';
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Set navigate function for API client
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  // Check if current page is chat page or game page
  const isChatPage = location.pathname === '/chat';
  const hideHeader = location.pathname.startsWith('/chat') || location.pathname.startsWith('/game');

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

  if (!authReady) {
    return <div className="flex min-h-screen items-center justify-center bg-seablue-50 text-seablue-700">Đang tải tài khoản...</div>;
  }

  return (
    <div className={`squirrel-app ${hideHeader ? 'h-screen w-full' : 'w-full'}`}>
      {/* Show navigation bar only for non-chat/non-game pages */}
      {!hideHeader && (
        <div className="w-full p-3 sm:p-4 bg-white border-b border-seablue-200 flex items-center justify-between shadow-sm">
          <Link to="/" className="text-lg sm:text-xl font-bold text-seablue-600 flex items-center gap-2">
            <img src="/avatar.png" alt="ThinkBridge squirrel" className="h-8 w-8 object-contain" />
            <span className="hidden xs:inline">ThinkBridge</span>
            <span className="xs:hidden">SE</span>
          </Link>
          <div className="text-xs sm:text-sm flex items-center gap-2 sm:gap-4">
            <button type="button" onClick={() => changeTheme(isDark ? 'light' : 'dark')} aria-label={isDark ? 'Chuyển light mode' : 'Chuyển dark mode'} className="rounded-lg px-2 py-1.5 text-base text-seablue-700 hover:bg-seablue-50 dark:text-seablue-300 dark:hover:bg-orange-950">
              {isDark ? '☀️' : '🌙'}
            </button>
            {token ? (
              <>
                {isAdmin ? <Link to="/" className="text-seablue-600 hover:text-seablue-700 font-medium px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">📊 Dashboard giáo viên</Link> : <>
                <Link to="/game" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">
                  <span className="text-sm">🎮</span>
                  <span className="hidden sm:inline">Game</span>
                </Link>
                <Link to="/leaderboard" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">
                  <span className="text-sm">🏆</span>
                  <span className="hidden sm:inline">{t('leaderboard.title')}</span>
                </Link>
                <Link to="/chat" className="text-seablue-600 hover:text-seablue-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">
                  <img src="/avatar.png" alt="Chat Logo" className="h-5 w-5 object-contain" />
                  <span className="hidden sm:inline">Chat</span>
                </Link>
                <Link to="/ai-tutor" className="text-seablue-600 hover:text-seablue-700 font-medium px-2 py-1 rounded-lg hover:bg-seablue-50 transition-colors">AI Tutor</Link>
                </>}
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
        <Route path="/" element={isAdmin ? <AdminDashboardPage /> : <HomePage />} />
        <Route path="/login" element={token ? <Navigate to={isAdmin ? "/" : "/chat"} replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to={isAdmin ? "/" : "/chat"} replace /> : <RegisterPage />} />
        <Route path="/chat" element={token ? (isAdmin ? <Navigate to="/" replace /> : <ChatPage />) : <Navigate to="/login" replace />} />
        <Route path="/leaderboard" element={token ? (isAdmin ? <Navigate to="/" replace /> : <LeaderboardPage />) : <Navigate to="/login" replace />} />
        <Route path="/practice" element={token ? (isAdmin ? <Navigate to="/" replace /> : <PracticePage />) : <Navigate to="/login" replace />} />
        <Route path="/thinking" element={token ? (isAdmin ? <Navigate to="/" replace /> : <ThinkingJournalPage />) : <Navigate to="/login" replace />} />
        <Route path="/ai-tutor" element={token ? (isAdmin ? <Navigate to="/" replace /> : <AITutorPage />) : <Navigate to="/login" replace />} />
        <Route path="/ai-tutor/:sessionId" element={token ? (isAdmin ? <Navigate to="/" replace /> : <AITutorPage />) : <Navigate to="/login" replace />} />
        <Route path="/admin" element={token && isAdmin ? <Navigate to="/" replace /> : <Navigate to="/chat" replace />} />
        <Route path="/game" element={isAdmin ? <Navigate to="/" replace /> : <GameHomePage />} />
        <Route path="/game/quiz" element={isAdmin ? <Navigate to="/" replace /> : <QuizGamePage />} />
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
