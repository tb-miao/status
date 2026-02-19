/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff7ff',
          100: '#ffedff',
          200: '#ffd7ff',
          300: '#ffb3ff',
          400: '#ff80ff',
          500: '#ff4dff',
          600: '#e600e6',
          700: '#cc00cc',
          800: '#b300b3',
          900: '#990099',
        },
        // 二次元风格颜色
        anime: {
          pink: '#ff77aa',
          blue: '#77ccff',
          purple: '#aa77ff',
          yellow: '#ffcc77',
          green: '#77ffaa',
          red: '#ff7777',
        },
        // 状态颜色
        status: {
          up: '#77ffaa',
          down: '#ff7777',
          paused: '#ffcc77',
          unknown: '#a0a0a0',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glass-dark': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'soft': '0 2px 16px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
      }
    },
  },
  plugins: [],
};