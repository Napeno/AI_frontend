import React, { useState, useEffect } from 'react';

const RankUpAnimation = ({ rankUpData, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [stage, setStage] = useState(0); // 0: fade in, 1: celebration, 2: fade out

  useEffect(() => {
    if (rankUpData) {
      setIsVisible(true);
      setStage(0);

      const timer1 = setTimeout(() => setStage(1), 500);
      const timer2 = setTimeout(() => setStage(2), 3000);
      const timer3 = setTimeout(() => {
        setIsVisible(false);
        onComplete && onComplete();
      }, 4000);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [rankUpData, onComplete]);

  if (!isVisible || !rankUpData) return null;

  const RANK_COLORS = {
    bronze: 'from-orange-600 to-orange-800',
    silver: 'from-gray-300 to-gray-500',
    gold: 'from-yellow-400 to-yellow-600',
    platinum: 'from-slate-300 to-slate-500',
    diamond: 'from-amber-300 to-orange-500',
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-all duration-1000 ${
      stage === 0 ? 'opacity-0' : stage === 1 ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`text-center transform transition-all duration-1000 ${
        stage === 0 ? 'scale-50 opacity-0' : stage === 1 ? 'scale-100 opacity-100' : 'scale-150 opacity-0'
      }`}>
        {/* Rank Up Badge */}
        <div className={`inline-block px-8 py-4 bg-gradient-to-r ${RANK_COLORS[rankUpData.newRank]} rounded-full shadow-2xl mb-6`}>
          <div className="text-6xl mb-2 animate-bounce">
            {rankUpData.icon}
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            RANK UP!
          </h1>
          <p className="text-xl text-white/90 drop-shadow">
            {rankUpData.displayName}
          </p>
        </div>

        {/* Description */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-md mx-auto">
          <p className="text-lg text-gray-800 dark:text-gray-200 font-semibold mb-2">
            {rankUpData.displayDescription}
          </p>
          <div className="flex items-center justify-center gap-2 text-purple-600 dark:text-purple-400">
            <span className="text-2xl">⭐</span>
            <span className="font-bold">
              {rankUpData.points} điểm
            </span>
          </div>
        </div>

        {/* Confetti Animation */}
        {stage === 1 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className={`absolute animate-ping`}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              >
                {['🎉', '✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 5)]}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RankUpAnimation;