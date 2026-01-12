/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // === DVPE Visual Grammar Color System ===

        // Background Layers (dark theme)
        'bg-deep': '#0a0e14',
        'bg-primary': '#0d1117',
        'bg-elevated': '#161b22',
        'bg-surface': '#1a2028',

        // Audio Signal Colors (Cyan/Blue)
        'audio': {
          DEFAULT: '#22d3ee',
          primary: '#22d3ee',     // cyan-400
          secondary: '#06b6d4',   // cyan-500
          muted: '#0891b2',       // cyan-600
          'block-bg': '#0e4a5c',
          'block-border': '#155e75',
          wire: '#22d3ee',
        },

        // Control Voltage Colors (Yellow)
        'cv': {
          DEFAULT: '#facc15',
          primary: '#facc15',     // yellow-400
          secondary: '#eab308',   // yellow-500
          muted: '#ca8a04',       // yellow-600
          'block-bg': '#422006',
          'block-border': '#713f12',
          wire: '#facc15',
        },

        // Trigger/Gate Colors (Orange)
        'trigger': {
          DEFAULT: '#fb923c',
          primary: '#fb923c',     // orange-400
          secondary: '#f97316',   // orange-500
          muted: '#ea580c',       // orange-600
          'block-bg': '#431407',
          'block-border': '#7c2d12',
          wire: '#fb923c',
        },

        // User Interaction Colors (Green)
        'user': {
          DEFAULT: '#4ade80',
          primary: '#4ade80',     // green-400
          secondary: '#22c55e',   // green-500
          muted: '#16a34a',       // green-600
          'block-bg': '#052e16',
          'block-border': '#166534',
        },

        // Signal Logic Colors (Violet)
        'logic': {
          DEFAULT: '#a78bfa',
          primary: '#a78bfa',     // violet-400
          secondary: '#8b5cf6',   // violet-500
          muted: '#7c3aed',       // violet-600
          'block-bg': '#2e1065',
          'block-border': '#4c1d95',
        },

        // Text Colors
        'text': {
          primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
        },

        // Surface Colors (using CSS variables)
        'surface': {
          primary: 'rgb(var(--color-surface-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-surface-secondary) / <alpha-value>)',
          tertiary: 'rgb(var(--color-surface-tertiary) / <alpha-value>)',
        },

        // Border Color
        'border': 'rgb(var(--color-border) / <alpha-value>)',

        // Semantic Colors
        'accent': {
          green: '#3fb950',
          red: '#f85149',
          yellow: '#d29922',
          purple: '#a371f7',
        },

        // Selection and Focus
        'selection': {
          DEFAULT: '#58a6ff',
          ring: '#388bfd',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },

      fontSize: {
        'xs': ['0.625rem', { lineHeight: '1.2' }],   // 10px
        'sm': ['0.6875rem', { lineHeight: '1.4' }],  // 11px
        'base': ['0.75rem', { lineHeight: '1.5' }],  // 12px
        'md': ['0.8125rem', { lineHeight: '1.5' }],  // 13px
        'lg': ['0.875rem', { lineHeight: '1.5' }],   // 14px
        'xl': ['1rem', { lineHeight: '1.5' }],       // 16px
      },

      spacing: {
        // 4px base unit system
        '0.5': '2px',
        '1': '4px',
        '1.5': '6px',
        '2': '8px',
        '2.5': '10px',
        '3': '12px',
        '3.5': '14px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '28px',
        '8': '32px',
      },

      borderRadius: {
        'sm': '2px',
        'DEFAULT': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
      },

      boxShadow: {
        'glow-audio': '0 0 8px rgba(34, 211, 238, 0.4)',
        'glow-cv': '0 0 8px rgba(250, 204, 21, 0.4)',
        'glow-trigger': '0 0 8px rgba(251, 146, 60, 0.4)',
        'glow-user': '0 0 8px rgba(74, 222, 128, 0.4)',
        'glow-logic': '0 0 8px rgba(167, 139, 250, 0.4)',
        'block': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.2)',
        'block-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.3)',
      },

      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'signal-flow': 'signal-flow 1s linear infinite',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'slide-in-right': 'slide-in-right 0.2s ease-out',
        'slide-in-left': 'slide-in-left 0.2s ease-out',
      },

      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'signal-flow': {
          '0%': { strokeDashoffset: '20' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'slide-in-right': {
          '0%': { opacity: '0', transform: 'translateX(10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      transitionDuration: {
        'instant': '0ms',
        'fast': '100ms',
        'normal': '200ms',
        'slow': '300ms',
        'deliberate': '500ms',
      },

      transitionTimingFunction: {
        'ease-out-custom': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in-out-custom': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
}
