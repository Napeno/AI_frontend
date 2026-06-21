import React, { useState, useEffect } from 'react';

const SealAnimation = ({ trigger, onComplete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [animationType, setAnimationType] = useState('bounce');

  useEffect(() => {
    if (trigger) {
      setIsVisible(true);
      
      // Determine animation type based on trigger type
      switch (trigger.type) {
        case 'check-answer':
          setAnimationType(trigger.isCorrect ? 'success' : 'error');
          break;
        case 'hint':
          setAnimationType('hint');
          break;
        case 'full-answer':
          setAnimationType('reveal');
          break;
        case 'new-question':
          setAnimationType('welcome');
          break;
        default:
          setAnimationType('bounce');
      }

      // Auto-hide after animation
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onComplete) onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  if (!isVisible) return null;

  const getAnimationClasses = () => {
    const baseClasses = "seal-animation";
    
    switch (animationType) {
      case 'success':
        return `${baseClasses} animate-seal-bounce text-green-500`;
      case 'error':
        return `${baseClasses} animate-wave text-red-500`;
      case 'hint':
        return `${baseClasses} animate-float text-yellow-500`;
      case 'reveal':
        return `${baseClasses} animate-seal-bounce text-purple-500`;
      case 'welcome':
        return `${baseClasses} animate-wave text-seablue-500`;
      default:
        return `${baseClasses} animate-seal-bounce text-seablue-500`;
    }
  };

  const getSealExpression = () => {
    switch (animationType) {
      case 'success':
        return '🦭✨'; // Happy seal with sparkles
      case 'error':
        return '🦭💭'; // Thinking seal
      case 'hint':
        return '🦭💡'; // Seal with lightbulb
      case 'reveal':
        return '🦭📖'; // Seal with book
      case 'welcome':
        return '🦭👋'; // Waving seal
      default:
        return <img src="/image/sealedu-logo.png" alt="ThinkBridge Logo" className="w-8 h-8 mx-auto" />; // Default seal
    }
  };

  const getMessage = () => {
    switch (animationType) {
      case 'success':
        return 'Great job!';
      case 'error':
        return 'Try again!';
      case 'hint':
        return 'Here\'s a hint!';
      case 'reveal':
        return 'Here\'s the answer!';
      case 'welcome':
        return 'Let\'s learn!';
      default:
        return '';
    }
  };

  return (
    <div className={`${getAnimationClasses()} ${isVisible ? 'show' : 'hide'}`}>
      <div className="bg-white rounded-full p-3 shadow-lg border-2 border-seablue-300 w-40">
        <div className="text-3xl text-center">
          {getSealExpression()}
        </div>
        {getMessage() && (
          <div className="text-xs text-center mt-1 text-seablue-600 font-medium">
            {getMessage()}
          </div>
        )}
      </div>
    </div>
  );
};

export default SealAnimation;