/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // SealEdu brand colors
        seablue: {
          50: '#f0fdfc',
          100: '#ccfbf7',
          200: '#99f6f0',
          300: '#5eeee8',
          400: '#2dd4bf',
          500: '#7eeadd', // Main brand color
          600: '#0ea5ba',
          700: '#0d8499',
          800: '#155e75',
          900: '#164e63',
        },
        // Ocean gradient colors
        ocean: {
          light: '#7eeadd',
          medium: '#06b6d4',
          deep: '#0e7490',
          dark: '#164e63',
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
      },
      keyframes: {
        typing: {
          '0%, 80%, 100%': {
            transform: 'scale(0.8)',
            opacity: '0.5',
          },
          '40%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        'seal-bounce': {
          '0%, 20%, 50%, 80%, 100%': {
            transform: 'translateY(0)',
          },
          '40%': {
            transform: 'translateY(-10px)',
          },
          '60%': {
            transform: 'translateY(-5px)',
          },
        },
        wave: {
          '0%, 100%': {
            transform: 'rotate(0deg)',
          },
          '25%': {
            transform: 'rotate(-10deg)',
          },
          '75%': {
            transform: 'rotate(10deg)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-20px)',
          },
        },
      },
      backgroundImage: {
        'ocean-gradient': 'linear-gradient(135deg, #7eeadd 0%, #06b6d4 25%, #0e7490 75%, #164e63 100%)',
        'seablue-gradient': 'linear-gradient(135deg, #7eeadd 0%, #2dd4bf 50%, #0ea5ba 100%)',
        'wave-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237eeadd' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
} 