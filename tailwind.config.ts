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
        // ── App surfaces (sidebar, cards, dashboard) ──────────────
        void:         '#060810',
        deep:         '#0B0F1E',
        surface:      '#111527',
        card:         '#161B2E',
        'card-hover': '#1C2240',

        // ── Landing page surfaces ─────────────────────────────────
        'lp-bg':      '#080C18',   // landing main bg (slightly warmer than void)
        'lp-nav':     '#060910',   // top bar + footer bg
        'lp-card':    '#0D1021',   // celebrity card bg
        'lp-surface': '#111527',   // prize row + tier cards

        // ── Accents ───────────────────────────────────────────────
        gold:         '#FFD700',   // primary — matches landing + handoff #FFD700
        'gold-warm':  '#E8A020',   // gradient end stop
        'gold-dim':   '#FFA500',   // legacy alias
        cyan:         '#00D4FF',
        'sw-red':     '#FF4560',
        'sw-green':   '#00E396',
        win:          '#22C55E',
        loss:         '#EF4444',

        // ── Tier colours ──────────────────────────────────────────
        bronze:       '#CD7F32',
        silver:       '#C0C0C0',
        platinum:     '#E5E4E2',

        // ── Design system aliases (handoff doc) ───────────────────
        'sw-bg':       '#0B0F1E',
        'sw-card':     '#13172B',
        'sw-card-2':   '#1A1F35',
        'sw-border':   '#1E2440',
        'sw-border-2': '#2A3060',
      },

      fontFamily: {
        // Outfit = font-heading (landing + app headings)
        // Inter   = font-body   (landing body text)
        // DM Sans = font-body   (app body — loaded in index.css)
        heading: ['Outfit', 'Syne', 'sans-serif'],
        body:    ['Inter',  'DM Sans', 'sans-serif'],
      },

      fontSize: {
        '2xs': ['10px', '14px'],
      },

      letterSpacing: {
        widest2: '0.2em',
        widest3: '0.3em',
      },

      spacing: {
        sidebar:        '68px',
        'sidebar-open': '220px',
        topbar:         '56px',
      },

      borderRadius: {
        card: '12px',
        xl2:  '16px',
        lp:   '4px',   // landing page sharp radius (like reference image)
      },

      boxShadow: {
        card:          '0 8px 32px rgba(0,0,0,0.5)',
        'glow-gold':   '0 0 24px rgba(255,215,0,0.3)',
        'glow-gold-lg':'0 4px 20px rgba(255,215,0,0.4)',
        'glow-cyan':   '0 0 20px rgba(0,212,255,0.25)',
        'inner-gold':  'inset 0 0 20px rgba(255,215,0,0.08)',
        'lp-card':     '0 12px 32px rgba(0,0,0,0.7)',
      },

      backgroundImage: {
        // App gradients
        'gold-gradient':  'linear-gradient(135deg, #FFD700 0%, #E8A020 100%)',
        'dark-gradient':  'linear-gradient(180deg, #111527 0%, #060810 100%)',
        'card-gradient':  'linear-gradient(135deg, #1C2240 0%, #161B2E 100%)',
        'hero-gradient':  'linear-gradient(to bottom, transparent 40%, #060810 100%)',
        'tier-bronze':    'linear-gradient(135deg, rgba(205,127,50,0.2) 0%, rgba(205,127,50,0.05) 100%)',
        'tier-silver':    'linear-gradient(135deg, rgba(184,196,208,0.15) 0%, rgba(184,196,208,0.04) 100%)',
        'tier-platinum':  'linear-gradient(135deg, rgba(232,224,240,0.15) 0%, rgba(232,224,240,0.04) 100%)',
        'grid-pattern':   'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px)',
        // Landing gradients
        'lp-hero-left':   'linear-gradient(to right, #080C18 35%, rgba(8,12,24,0.6) 65%, transparent)',
        'lp-hero-bottom': 'linear-gradient(to top, #080C18 0%, transparent 60%)',
        'lp-glow-gold':   'radial-gradient(ellipse 50% 70% at 20% 50%, rgba(255,215,0,0.06) 0%, transparent 70%)',
      },

      animation: {
        'spin-slow':    'spin 3s linear infinite',
        'glow-pulse':   'glowPulse 2s ease-in-out infinite alternate',
        'live-pulse':   'livePulse 1.5s ease-in-out infinite',
        'fade-up':      'fadeUp 350ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-up-slow': 'fadeUp 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'slide-right':  'slideInRight 320ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'shimmer':      'shimmer 1.6s linear infinite',
        'marquee':      'marquee 28s linear infinite',
        'win-flash':    'winFlash 0.6s ease forwards',
      },

      keyframes: {
        glowPulse: {
          '0%':   { textShadow: '0 0 5px rgba(255,215,0,0.4)' },
          '100%': { textShadow: '0 0 20px rgba(255,215,0,0.9), 0 0 40px rgba(255,215,0,0.4)' },
        },
        livePulse: {
          '0%,100%': { opacity: '1', transform: 'scale(1)' },
          '50%':     { opacity: '0.4', transform: 'scale(0.7)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(110%)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '-200% 0' },
          to:   { backgroundPosition: '200% 0' },
        },
        marquee: {
          from: { transform: 'translateX(0)' },
          to:   { transform: 'translateX(-50%)' },
        },
        winFlash: {
          '0%':   { boxShadow: '0 0 0 0 rgba(255,215,0,0.8)' },
          '70%':  { boxShadow: '0 0 0 16px rgba(255,215,0,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,215,0,0)' },
        },
      },
    },
  },
  plugins: [forms],
} satisfies Config
