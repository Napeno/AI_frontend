import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import t from '../locales/i18n';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9000';

// Avatar emojis mapping
const AVATAR_EMOJIS = {
  default: '👤',
  student: '🧑‍🎓',
  teacher: '👩‍🏫',
  scientist: '🧑‍🔬',
  artist: '🧑‍🎨',
  engineer: '👷',
  astronaut: '🧑‍🚀',
  detective: '🕵️',
  ninja: '🥷',
  wizard: '🧙‍♂️',
  crown: '👑',
  unicorn: '🦄',
};

// Rank colors and icons
const getRankInfo = (rank) => {
  if (rank === 1) return { color: 'text-yellow-500', bg: 'bg-yellow-50', icon: '👑' };
  if (rank === 2) return { color: 'text-gray-400', bg: 'bg-gray-50', icon: '🥈' };
  if (rank === 3) return { color: 'text-orange-500', bg: 'bg-orange-50', icon: '🥉' };
  if (rank <= 10) return { color: 'text-blue-500', bg: 'bg-blue-50', icon: '⭐' };
  return { color: 'text-gray-500', bg: 'bg-gray-50', icon: '#' };
};

const LeaderboardPage = () => {
  const { token, user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchLeaderboard();
  }, [currentPage]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/leaderboard?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data.users || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
setError(t('leaderboard.loadingError'));
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-seablue-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-seablue-500"></div>
<p className="mt-4 text-seablue-600 dark:text-seablue-400">{t('leaderboard.loading')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-seablue-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-seablue-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 sm:gap-3">
                🏆 {t('leaderboard.title')}
              </h1>
              <p className="text-xs sm:text-sm text-seablue-600 dark:text-gray-400 mt-1">
{t('leaderboard.subtitle')}
              </p>
            </div>
            <Link 
              to="/chat" 
              className="px-3 py-2 sm:px-4 bg-seablue-gradient text-white rounded-lg hover:shadow-md transition-all duration-200 font-medium flex items-center gap-2"
            >
              <img src="/image/sealedu-logo.png" alt="Chat Logo" className="w-5 h-5" />
              <span className="hidden sm:inline">{t('leaderboard.backToChat')}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Current User Highlight */}
        {user && (
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-seablue-200 dark:border-seablue-600">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
🎯 {t('leaderboard.yourPosition')}
            </h2>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-seablue-50 dark:bg-seablue-900/30 rounded-lg">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md">
                  {AVATAR_EMOJIS[user.avatar || 'default'] || '👤'}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">{user.name || 'You'}</p>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-2">
                <div className="flex items-center gap-1 sm:gap-2 mb-1">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" className="text-blue-600"/>
                    <circle cx="12" cy="12" r="8" className="text-blue-400"/>
                    <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-blue-700">P</text>
                  </svg>
                  <span className="font-bold text-blue-600 text-sm sm:text-base">{(user.points || 0).toLocaleString()}</span>
                </div>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">điểm xếp hạng</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 bg-seablue-gradient">
<h2 className="text-lg sm:text-xl font-semibold text-white">{t('leaderboard.topRankings')}</h2>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {leaderboardData.map((player) => {
              const rank = player.rank;
              const rankInfo = getRankInfo(rank);
              const isCurrentUser = user && player._id === user._id;
              
              return (
                <div 
                  key={player._id || player.id} 
                  className={`p-3 sm:p-4 md:p-6 transition-colors ${
                    isCurrentUser 
                      ? 'bg-seablue-50 dark:bg-seablue-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      {/* Rank */}
                      <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full ${rankInfo.bg} flex items-center justify-center flex-shrink-0`}>
                        <span className={`font-bold ${rankInfo.color} text-sm sm:text-xl`}>
                          {rank <= 3 ? rankInfo.icon : rank}
                        </span>
                      </div>
                      
                      {/* Avatar */}
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl sm:text-2xl shadow-md flex-shrink-0">
                        {AVATAR_EMOJIS[player.avatar || 'default'] || '👤'}
                      </div>
                      
                      {/* User Info */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-gray-800 dark:text-gray-200 truncate text-sm sm:text-base">
                            {player.name || `User ${player.id}`}
                          </p>
                          {isCurrentUser && (
                            <span className="px-2 py-0.5 sm:py-1 bg-seablue-600 text-white text-[10px] sm:text-xs rounded-full flex-shrink-0">
  {t('leaderboard.you')}
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{player.email}</p>
                      </div>
                    </div>
                    
                    {/* Score */}
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="flex items-center gap-1 sm:gap-2 mb-1">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" className="text-blue-600"/>
                          <circle cx="12" cy="12" r="8" className="text-blue-400"/>
                          <text x="12" y="16" textAnchor="middle" className="text-xs font-bold fill-blue-700">P</text>
                        </svg>
                        <span className="font-bold text-blue-600 text-sm sm:text-xl">
                          {(player.points || 0).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">điểm</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-700 dark:text-gray-300">
{t('leaderboard.page')} {currentPage} {t('leaderboard.of')} {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
{t('leaderboard.previous')}
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
{t('leaderboard.next')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {leaderboardData.length === 0 && !loading && (
          <div className="text-center py-12">
            <img src="/image/sealedu-logo.png" alt="SealEdu Logo" className="w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">Chưa có dữ liệu xếp hạng</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Hãy bắt đầu trò chuyện và kiếm điểm để xuất hiện trên bảng xếp hạng!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;