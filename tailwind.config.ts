import type { Config } from 'tailwindcss';

export default {
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      colors: {
        neural: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
        },
        dark: {
          900: '#0a0a1a',
          800: '#0f0f23',
          700: '#141428',
          600: '#1a1a35',
          500: '#1e1e3e',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'neural-glow': 'radial-gradient(ellipse at center, rgba(99,102,241,0.15) 0%, transparent 70%)',
        'hero-pattern': 'radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99,102,241,0.3) 0%, rgba(10,10,26,0) 100%)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        glow: 'glow 2s ease-in-out infinite alternate',
        scan: 'scan 3s linear infinite',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(99,102,241,0.4)' },
          '100%': { boxShadow: '0 0 40px rgba(99,102,241,0.8), 0 0 80px rgba(99,102,241,0.3)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      boxShadow: {
        neural: '0 0 30px rgba(99,102,241,0.3)',
        'neural-lg': '0 0 60px rgba(99,102,241,0.4)',
        cyan: '0 0 30px rgba(34,211,238,0.3)',
        'glow-sm': '0 0 10px rgba(99,102,241,0.5)',
      },
      /* html { font-size: 62.5% } — default Tailwind max-w-* (rem) maps to ~800px for “7xl”; use px for real desktop width */
      maxWidth: {
        landing: '1280px',
        'landing-card': '896px',
        'landing-copy': '768px',
        'landing-form': '576px',
        'auth-panel': '420px',
        'auth-panel-wide': '520px',
      },
    },
  },
} satisfies Partial<Config>;
