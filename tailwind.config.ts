import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      colors: {
        bg: '#07090f',
        surface: '#0d1117',
        surface2: '#131920',
        border: '#1e2a35',
        green: {
          DEFAULT: '#00d4a0',
          dim: 'rgba(0,212,160,0.1)',
          glow: 'rgba(0,212,160,0.15)',
        },
        red: {
          elo: '#ff4d6a',
          dim: 'rgba(255,77,106,0.1)',
        },
        amber: {
          elo: '#ffb547',
          dim: 'rgba(255,181,71,0.1)',
        },
        blue: {
          elo: '#4d9fff',
          dim: 'rgba(77,159,255,0.1)',
        },
        purple: {
          elo: '#8b5cf6',
          dim: 'rgba(139,92,246,0.1)',
        },
        muted: '#4a5568',
        dim: '#718096',
        'text-primary': '#e2e8f0',
        'text-secondary': '#a0aec0',
      },
      animation: {
        blink: 'blink 2s ease-in-out infinite',
        'pulse-border': 'pulse-border 2s ease-in-out infinite',
        'slide-in': 'slide-in 0.3s ease-out',
        spin: 'spin 0.7s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        'pulse-border': {
          '0%, 100%': { borderColor: 'rgba(255,77,106,0.4)', boxShadow: '0 0 0 0 rgba(255,77,106,0)' },
          '50%': { borderColor: 'rgba(255,77,106,0.8)', boxShadow: '0 0 12px 2px rgba(255,77,106,0.15)' },
        },
        'slide-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0,212,160,0.15)',
        'glow-red': '0 0 20px rgba(255,77,106,0.15)',
        'card': '0 1px 3px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}

export default config
