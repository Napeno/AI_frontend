import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const RankDisplay = ({ showProgress = true, size = 'medium', layout = 'badge', pointsAnimationTrigger }) => {
  const { user } = useAuth();
  const [animatingPoints, setAnimatingPoints] = useState([]);

  // Handle points animation trigger
  useEffect(() => {
    if (pointsAnimationTrigger && pointsAnimationTrigger.amount > 0) {
      const newPoint = {
        id: Date.now(),
        amount: pointsAnimationTrigger.amount,
      };
      setAnimatingPoints(prev => [...prev, newPoint]);
      
      // Remove animation after 2 seconds
      setTimeout(() => {
        setAnimatingPoints(prev => prev.filter(p => p.id !== newPoint.id));
      }, 2000);
    }
  }, [pointsAnimationTrigger]);

  const RANK_INFO = {
    iron: { name: 'Iron', nameVi: 'Sắt', color: '#71717A', bgGradient: 'from-gray-400 to-gray-600', icon: '🔗', threshold: 0 },
    bronze: { name: 'Bronze', nameVi: 'Đồng', color: '#CD7F32', bgGradient: 'from-orange-600 to-orange-800', icon: '🥉', threshold: 100 },
    silver: { name: 'Silver', nameVi: 'Bạc', color: '#C0C0C0', bgGradient: 'from-gray-300 to-gray-500', icon: '🥈', threshold: 300 },
    gold: { name: 'Gold', nameVi: 'Vàng', color: '#FFD700', bgGradient: 'from-yellow-400 to-yellow-600', icon: '🥇', threshold: 600 },
    platinum: { name: 'Platinum', nameVi: 'Bạch Kim', color: '#E5E4E2', bgGradient: 'from-slate-300 to-slate-500', icon: '💎', threshold: 1000 },
    diamond: { name: 'Diamond', nameVi: 'Kim Cương', color: '#B9F2FF', bgGradient: 'from-cyan-300 to-blue-500', icon: '💠', threshold: 1500 },
  };

  const userRank = user?.rank || 'iron';
  const userPoints = user?.points || 0;
  const rankInfo = RANK_INFO[userRank];

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
    small: { container: 'px-2 py-1', icon: 'text-sm', text: 'text-xs', badge: 'text-xs px-2 py-1' },
    medium: { container: 'px-3 py-2', icon: 'text-lg', text: 'text-sm', badge: 'text-sm px-3 py-1.5' },
    large: { container: 'px-4 py-3', icon: 'text-2xl', text: 'text-base', badge: 'text-base px-4 py-2' },
    xlarge: { container: 'px-5 py-4', icon: 'text-3xl', text: 'text-lg', badge: 'text-lg px-5 py-3' },
  };

  const currentSize = sizeClasses[size] || sizeClasses.medium;

if (layout === 'leaderboard') {
    return (
      <div className="w-full p-3 rounded-xl bg-gradient-to-r from-seablue-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border border-seablue-200 dark:border-gray-600 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${rankInfo.bgGradient} text-white text-lg shadow-md`}>
              {rankInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">{user?.name || 'User'}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{rankInfo.nameVi} • {userPoints.toLocaleString()} điểm</div>
            </div>
          </div>
          {nextRank && (
            <div className="text-right">
              <div className="text-xs text-gray-600 dark:text-gray-400">{pointsToNext} điểm nữa</div>
              <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mt-1">
                <div className={`bg-gradient-to-r ${RANK_INFO[nextRank].bgGradient} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          )}
        </div>
        
        {/* Animated Points */}
        {animatingPoints.map((point) => (
          <div
            key={point.id}
            className="absolute top-0 right-0 pointer-events-none z-50"
            style={{
              animation: `pointsFly 2s ease-out forwards`,
            }}
          >
            <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
              <span>📊</span>
              <span>+{point.amount}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${rankInfo.bgGradient} text-white text-sm`}>
            {rankInfo.icon}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">{rankInfo.nameVi || rankInfo.name}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400">{userPoints.toLocaleString()} điểm</div>
          </div>
        </div>
        {showProgress && nextRank && (
          <div className="text-right">
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">{pointsToNext} điểm nữa</div>
            <div className="w-12 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className={`bg-gradient-to-r ${RANK_INFO[nextRank].bgGradient} h-1.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>
        )}
        {showProgress && !nextRank && (
          <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">✨ Max</div>
        )}
      </div>
      
      {/* Animated Points */}
      {animatingPoints.map((point) => (
        <div
          key={point.id}
          className="absolute top-0 right-0 pointer-events-none z-50"
          style={{
            animation: `pointsFly 2s ease-out forwards`,
          }}
        >
          <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
            <span>📊</span>
            <span>+{point.amount}</span>
          </div>
        </div>
      ))}

    </div>
  );
};

export default RankDisplay;