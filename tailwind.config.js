/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // ThinkBridge brand colors - squirrel orange theme
        seablue: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Main brand color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        // Acorn gradient colors (squirrel browns)
        ocean: {
          light: '#fdba74',
          medium: '#f97316',
          deep: '#c2410c',
          dark: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ["'Be Vietnam Pro'", 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'],
      },
      animation: {
        'typing': 'typing 1.4s infinite ease-in-out',
        'seal-bounce': 'seal-bounce 2s infinite',
        'wave': 'wave 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'game-shake': 'game-shake 0.4s ease-in-out',
        'quiz-countdown-pop': 'quizCountdownPop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'quiz-ripple': 'quizRipple 1.5s ease-out infinite',
        'quiz-fade-in': 'quizFadeIn 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-out-left': 'slideOutLeft 0.3s cubic-bezier(0.55, 0.085, 0.68, 0.53) forwards',
        'slide-in-left': 'slideInLeft 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'answer-option-in': 'answerOptionIn 0.35s ease-out forwards',
        'check-pop': 'checkPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'level-pop': 'levelPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'result-reveal': 'resultReveal 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'emoji-result-bounce': 'emojiResultBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'confetti-fall': 'confettiFall 2.5s ease-out forwards',
        'progress-pulse': 'progressPulse 0.4s ease-out',
        'rpg-dust-float': 'rpgDustFloat linear infinite',
        'rpg-lamp-flicker': 'rpgLampFlicker 3s ease-in-out infinite alternate',
        'rpg-seal-idle': 'rpgSealIdle 3.5s ease-in-out infinite',
        'rpg-btn-shine': 'rpgBtnShine 3s ease-in-out infinite',
      },
      keyframes: {
        typing: {
          '0%, 80%, 100%': { transform: 'scale(0.8)', opacity: '0.5' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        'seal-bounce': {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
        wave: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-10deg)' },
          '75%': { transform: 'rotate(10deg)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'game-shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px) rotate(-1deg)' },
          '75%': { transform: 'translateX(4px) rotate(1deg)' },
        },
        quizCountdownPop: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        quizRipple: {
          '0%': { transform: 'scale(0.5)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        quizFadeIn: {
          'from': { opacity: '0', transform: 'translateY(12px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          'from': { opacity: '0', transform: 'translateX(60px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        slideOutLeft: {
          'from': { opacity: '1', transform: 'translateX(0)' },
          'to': { opacity: '0', transform: 'translateX(-60px)' },
        },
        slideInLeft: {
          'from': { opacity: '0', transform: 'translateX(-60px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        answerOptionIn: {
          'from': { opacity: '0', transform: 'translateX(30px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        checkPop: {
          '0%': { transform: 'scale(0) rotate(-45deg)' },
          '60%': { transform: 'scale(1.3) rotate(10deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        levelPop: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        resultReveal: {
          '0%': { opacity: '0', transform: 'scale(0.9) translateY(30px)' },
          '60%': { transform: 'scale(1.02) translateY(-5px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        emojiResultBounce: {
          '0%': { transform: 'scale(0) rotate(-20deg)' },
          '40%': { transform: 'scale(1.3) rotate(10deg)' },
          '60%': { transform: 'scale(0.9) rotate(-5deg)' },
          '80%': { transform: 'scale(1.1) rotate(2deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        confettiFall: {
          '0%': { opacity: '1', transform: 'translateY(0) rotate(0deg) scale(1)' },
          '25%': { opacity: '1', transform: 'translateY(100px) rotate(120deg) translateX(30px) scale(1.2)' },
          '50%': { opacity: '0.8', transform: 'translateY(250px) rotate(240deg) translateX(-20px) scale(0.9)' },
          '100%': { opacity: '0', transform: 'translateY(500px) rotate(360deg) translateX(15px) scale(0.5)' },
        },
        progressPulse: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.3)' },
        },
        rpgDustFloat: {
          '0%': { transform: 'translateY(100vh) translateX(0)', opacity: '0' },
          '10%': { opacity: '0.6' },
          '90%': { opacity: '0.3' },
          '100%': { transform: 'translateY(-20vh) translateX(30px)', opacity: '0' },
        },
        rpgLampFlicker: {
          '0%': { opacity: '0.7', transform: 'scale(1)' },
          '25%': { opacity: '0.85', transform: 'scale(1.05)' },
          '50%': { opacity: '0.65', transform: 'scale(0.97)' },
          '75%': { opacity: '0.9', transform: 'scale(1.03)' },
          '100%': { opacity: '0.75', transform: 'scale(1)' },
        },
        rpgSealIdle: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg) scaleY(1)' },
          '25%': { transform: 'translateY(-4px) rotate(4deg) scaleY(1.02)' },
          '50%': { transform: 'translateY(0) rotate(0deg) scaleY(0.98)' },
          '75%': { transform: 'translateY(-2px) rotate(-4deg) scaleY(1.01)' },
        },
        rpgBtnShine: {
          '0%': { left: '-100%' },
          '50%': { left: '100%' },
          '100%': { left: '100%' },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #fdba74 0%, #f97316 25%, #c2410c 75%, #7c2d12 100%)',
        'seablue-gradient': 'linear-gradient(135deg, #fdba74 0%, #f97316 50%, #c2410c 100%)',
        'wave-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fdba74' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
} 