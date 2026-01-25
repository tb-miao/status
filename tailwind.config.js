/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // 状态颜色
        status: {
          up: '#10b981',
          down: '#ef4444',
          paused: '#f59e0b',
          unknown: '#6b7280',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'heartbeat': 'heartbeat 1.5s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'bounce-in': 'bounce-in 0.6s ease-out',
      },
      keyframes: {
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
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