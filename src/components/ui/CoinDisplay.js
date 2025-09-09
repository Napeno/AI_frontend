import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const CoinDisplay = ({ onCoinAnimation, coinAnimationTrigger }) => {
  const { user } = useAuth();
  const [animatingCoins, setAnimatingCoins] = useState([]);
  const [displayCoins, setDisplayCoins] = useState(user?.coins || 0);

  useEffect(() => {
    setDisplayCoins(user?.coins || 0);
  }, [user?.coins]);

  useEffect(() => {
    if (coinAnimationTrigger && coinAnimationTrigger.amount > 0) {
      triggerCoinAnimation(coinAnimationTrigger.amount, coinAnimationTrigger.sourceElement);
    }
  }, [coinAnimationTrigger]);

  const triggerCoinAnimation = (amount, sourceElement) => {
    const sourceRect = sourceElement?.getBoundingClientRect();
    const coinDisplayElement = document.getElementById('coin-display');
    const targetRect = coinDisplayElement?.getBoundingClientRect();

    if (!sourceRect || !targetRect) return;

    // Create animated coins
    const newAnimatingCoins = Array.from({ length: Math.min(amount / 5, 3) }, (_, index) => ({
      id: Date.now() + index,
      startX: sourceRect.left + sourceRect.width / 2,
      startY: sourceRect.top + sourceRect.height / 2,
      endX: targetRect.left + targetRect.width / 2,
      endY: targetRect.top + targetRect.height / 2,
      delay: index * 100,
    }));

    setAnimatingCoins(prev => [...prev, ...newAnimatingCoins]);

    // Remove coins after animation
    setTimeout(() => {
      setAnimatingCoins(prev => prev.filter(coin => !newAnimatingCoins.find(newCoin => newCoin.id === coin.id)));
      // Trigger number count-up animation
      animateCountUp(displayCoins, displayCoins + amount);
    }, 1000 + (newAnimatingCoins.length - 1) * 100);
  };

  const animateCountUp = (startValue, endValue) => {
    const duration = 500;
    const startTime = performance.now();
    
    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const currentValue = Math.floor(startValue + (endValue - startValue) * progress);
      setDisplayCoins(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  };

  return (
    <>
      {/* Coin Display */}
      <div 
        id="coin-display"
        className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <div className="relative">
          <svg 
            className="w-6 h-6 text-yellow-100 drop-shadow-sm" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" className="text-yellow-600"/>
            <circle cx="12" cy="12" r="8" className="text-yellow-400"/>
            <text 
              x="12" 
              y="16" 
              textAnchor="middle" 
              className="text-xs font-bold fill-yellow-700"
            >
              ¥
            </text>
          </svg>
        </div>
        <span className="font-bold text-yellow-100 text-sm drop-shadow-sm min-w-[2rem] text-center">
          {displayCoins.toLocaleString()}
        </span>
      </div>

      {/* Animated Coins */}
      {animatingCoins.map((coin) => (
        <div
          key={coin.id}
          className="fixed pointer-events-none z-50"
          style={{
            left: coin.startX,
            top: coin.startY,
            animation: `coinFly 1s ease-out ${coin.delay}ms forwards`,
            '--start-x': `${coin.startX}px`,
            '--start-y': `${coin.startY}px`,
            '--end-x': `${coin.endX}px`,
            '--end-y': `${coin.endY}px`,
          }}
        >
          <div className="animate-spin">
            <svg 
              className="w-8 h-8 text-yellow-500 drop-shadow-lg" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" className="text-yellow-600"/>
              <circle cx="12" cy="12" r="8" className="text-yellow-400"/>
              <text 
                x="12" 
                y="16" 
                textAnchor="middle" 
                className="text-xs font-bold fill-yellow-700"
              >
                ¥
              </text>
            </svg>
          </div>
        </div>
      ))}

      {/* CSS for coin animation */}
      <style jsx>{`
        @keyframes coinFly {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translate(calc(var(--end-x) - var(--start-x)), calc(var(--end-y) - var(--start-y) - 50px)) scale(1.2);
            opacity: 1;
          }
          100% {
            transform: translate(calc(var(--end-x) - var(--start-x)), calc(var(--end-y) - var(--start-y))) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CoinDisplay;