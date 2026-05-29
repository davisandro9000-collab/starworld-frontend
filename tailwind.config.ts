import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base surfaces — Stake-inspired dark palette
        'sw-bg':       '#0B0F1E',   // page background
        'sw-card':     '#13172B',   // card/panel surface
        'sw-card-2':   '#1A1F35',   // elevated card (hover state base)
        'sw-border':   '#1E2440',   // default border
        'sw-border-2': '#2A3060',   // hover / emphasis border

        // Brand accent — Cameo-inspired gold
        'gold':        '#FFD700',
        'gold-dark':   '#DAA520',
        'gold-dim':    '#FFA500',

        // Secondary accent — Stake cyan for wins/live elements
        'cyan':        '#00E5FF',
        'cyan-dim':    '#00B8CC',

        // Tier colours
        'bronze':      '#CD7F32',
        'silver':      '#C0C0C0',
        'platinum':    '#E5E4E2',

        // Semantic
        'win':         '#22C55E',
        'loss':        '#EF4444',
        'warn':        '#F59E0B',
      },

      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
      },

      fontSize: {
        'xxs': ['10px', { lineHeight: '14px' }],
      },

      borderRadius: {
        'sw': '10px',
        'sw-lg': '14px',
        'sw-xl': '20px',
      },

      boxShadow: {
        'gold':     '0 0 20px rgba(255, 215, 0, 0.25)',
        'gold-sm':  '0 0 8px rgba(255, 215, 0, 0.35)',
        'cyan':     '0 0 20px rgba(0, 229, 255, 0.25)',
        'card':     '0 8px 24px rgba(0, 0, 0, 0.5)',
        'inner-top':'inset 0 1px 0 rgba(255,255,255,0.04)',
      },

      backgroundImage: {
        'gold-gradient':    'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        'gold-gradient-v':  'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
        'dark-grid':        'linear-gradient(rgba(30,36,64,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30,36,64,0.5) 1px, transparent 1px)',
        'hero-glow':        'radial-gradient(ellipse at top, rgba(255,215,0,0.06) 0%, transparent 60%)',
        'card-glow-gold':   'linear-gradient(135deg, rgba(255,215,0,0.08) 0%, transparent 60%)',
        'card-glow-cyan':   'linear-gradient(135deg, rgba(0,229,255,0.08) 0%, transparent 60%)',
      },

      animation: {
        'spin-slow':      'spin 3s linear infinite',
        'bounce-slow':    'bounce 2s infinite',
        'pulse-fast':     'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-gold':      'glowGold 2s ease-in-out infinite alternate',
        'glow-cyan':      'glowCyan 2s ease-in-out infinite alternate',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up':    'slideInUp 0.3s ease-out',
        'fade-in':        'fadeIn 0.2s ease-out',
        'coin-pop':       'coinPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ticker':         'ticker 20s linear infinite',
      },

      keyframes: {
        glowGold: {
          '0%':   { textShadow: '0 0 5px #FFD700, 0 0 10px #FFD700' },
          '100%': { textShadow: '0 0 20px #FFD700, 0 0 40px #FFA500' },
        },
        glowCyan: {
          '0%':   { boxShadow: '0 0 5px rgba(0,229,255,0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0,229,255,0.6)' },
        },
        slideInRight: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)',    opacity: '1' },
        },
        slideInUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        coinPop: {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' },
        },
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },

      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },

      // Navbar + sidebar dimensions as design tokens
      height: {
        'navbar': '56px',
      },

      zIndex: {
        'navbar':  '50',
        'sidebar': '40',
        'popup':   '60',
        'modal':   '70',
      },
    },
  },
  plugins: [forms],
} satisfies Config
