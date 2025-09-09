import React from 'react';
import { useAuth } from '../../context/AuthContext';

const RankDisplay = ({ showProgress = true, size = 'medium' }) => {
  const { user } = useAuth();

  const RANK_INFO = {
    iron: {
      name: 'Iron',
      nameVi: 'Sắt',
      color: '#71717A',
      bgGradient: 'from-gray-400 to-gray-600',
      icon: '🔗',
      threshold: 0,
    },
    bronze: {
      name: 'Bronze',
      nameVi: 'Đồng',
      color: '#CD7F32',
      bgGradient: 'from-orange-600 to-orange-800',
      icon: '🥉',
      threshold: 100,
    },
    silver: {
      name: 'Silver',
      nameVi: 'Bạc',
      color: '#C0C0C0',
      bgGradient: 'from-gray-300 to-gray-500',
      icon: '🥈',
      threshold: 300,
    },
    gold: {
      name: 'Gold',
      nameVi: 'Vàng',
      color: '#FFD700',
      bgGradient: 'from-yellow-400 to-yellow-600',
      icon: '🥇',
      threshold: 600,
    },
    platinum: {
      name: 'Platinum',
      nameVi: 'Bạch Kim',
      color: '#E5E4E2',
      bgGradient: 'from-slate-300 to-slate-500',
      icon: '💎',
      threshold: 1000,
    },
    diamond: {
      name: 'Diamond',
      nameVi: 'Kim Cương',
      color: '#B9F2FF',
      bgGradient: 'from-cyan-300 to-blue-500',
      icon: '💠',
      threshold: 1500,
    },
  };

  const userRank = user?.rank || 'iron';
  const userPoints = user?.points || 0;
  const rankInfo = RANK_INFO[userRank];

  // Calculate next rank progress
  const ranks = Object.keys(RANK_INFO);
  const currentRankIndex = ranks.indexOf(userRank);
  const nextRank = currentRankIndex < ranks.length - 1 ? ranks[currentRankIndex + 1] : null;
  
  let progressPercent = 100;
  let pointsToNext = 0;
  
  if (nextRank) {
    const currentThreshold = rankInfo.threshold;
    const nextThreshold = RANK_INFO[nextRank].threshold;
    const progressPoints = userPoints - currentThreshold;
    const requiredPoints = nextThreshold - currentThreshold;
    progressPercent = Math.max(0, Math.min(100, (progressPoints / requiredPoints) * 100));
    pointsToNext = Math.max(0, nextThreshold - userPoints);
  }

  const sizeClasses = {
    small: {
      container: 'px-2 py-1',
      icon: 'text-sm',
      text: 'text-xs',
      badge: 'text-xs px-2 py-1',
    },
    medium: {
      container: 'px-3 py-2',
      icon: 'text-lg',
      text: 'text-sm',
      badge: 'text-sm px-3 py-1.5',
    },
    large: {
      container: 'px-4 py-3',
      icon: 'text-2xl',
      text: 'text-base',
      badge: 'text-base px-4 py-2',
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="space-y-2">
      {/* Rank Badge */}
      <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${rankInfo.bgGradient} text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ${currentSize.badge}`}>
        <span className={currentSize.icon}>{rankInfo.icon}</span>
        <span className="drop-shadow-sm">
          {rankInfo.nameVi || rankInfo.name}
        </span>
      </div>

      {/* Points Display */}
      <div className={`flex items-center gap-2 ${currentSize.text}`}>
        <span className="text-purple-600 dark:text-purple-400 font-semibold">
          📊 {userPoints.toLocaleString()} điểm
        </span>
      </div>

      {/* Progress Bar */}
      {showProgress && nextRank && (
        <div className="space-y-1">
          <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-400">
            <span>Tiến độ đến {RANK_INFO[nextRank].nameVi}</span>
            <span>{pointsToNext} điểm nữa</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${RANK_INFO[nextRank].bgGradient} h-2 rounded-full transition-all duration-500 ease-out`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Max Rank Message */}
      {showProgress && !nextRank && (
        <div className="text-xs text-center text-amber-600 dark:text-amber-400 font-semibold">
          ✨ Bạn đã đạt rank cao nhất! ✨
        </div>
      )}
    </div>
  );
};

export default RankDisplay;