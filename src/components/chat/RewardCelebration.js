import React, { useEffect, useState } from 'react';

const RewardCelebration = ({ reward }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!reward) return undefined;
    setVisible(true);
    const timeoutId = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(timeoutId);
  }, [reward]);

  if (!reward || !visible) return null;

  return (
    <div className="reward-celebration" aria-live="polite">
      <div className="reward-celebration-message">🎉 Chính xác!{Number(reward.chestnuts) > 0 && <> 🌰 <strong>+{reward.chestnuts}</strong></>}{reward.badge && <><br /><span>🏅 Huy hiệu mới: <strong>{reward.badge.title}</strong></span></>}</div>
      <div className="reward-confetti" aria-hidden="true">
        {Array.from({ length: 42 }, (_, index) => <span key={index} style={{ '--confetti-x': `${(index * 37) % 101}vw`, '--confetti-delay': `${(index % 9) * 70}ms`, '--confetti-color': ['#f97316', '#facc15', '#10b981', '#60a5fa', '#f472b6'][index % 5] }} />)}
      </div>
      {Array.from({ length: 5 }, (_, index) => <span key={index} className="reward-chestnut" style={{ '--chestnut-x': `${(index - 2) * 52}px`, '--chestnut-delay': `${index * 90}ms` }}>🌰</span>)}
    </div>
  );
};

export default RewardCelebration;
