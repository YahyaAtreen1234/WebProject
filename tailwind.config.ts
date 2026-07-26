import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // The App Router lives at ./app, not ./src/app — without this, classes used
    // only in page files (e.g. lg:grid-cols-6) never make it into the CSS.
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // StonesLand Gemstone-Inspired Palette - Yellow & Black Theme
        midnight: {
          50: '#f0f2f5',
          100: '#d9dfe8',
          600: '#1a1a1a',
          700: '#0f0f0f',
          800: '#000000',
          900: '#000000',
        },
        sapphire: {
          300: '#fef08a',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
          700: '#a16207',
        },
        emerald: {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        amethyst: {
          300: '#c084fc',
          400: '#a855f7',
          500: '#9333ea',
          600: '#7e22ce',
          700: '#6b21a8',
        },
        rose: {
          300: '#f472b6',
          400: '#ec4899',
          500: '#db2777',
          600: '#be185d',
          700: '#831843',
        },
        gold: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      fontFamily: {
        serif: ['Crimson Text', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        h1: ['4rem', { lineHeight: '1', fontWeight: '800' }],
        h2: ['3rem', { lineHeight: '1.1', fontWeight: '700' }],
        h3: ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        h4: ['1.875rem', { lineHeight: '1.3', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
        small: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        gutter: '2rem',
        'gutter-lg': '4rem',
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0em',
        wide: '0.05em',
        wider: '0.1em',
      },
      backgroundImage: {
        'gradient-gemstone': 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)',
        'gradient-radial-gem': 'radial-gradient(circle, #667eea 0%, #764ba2 50%, #1f2937 100%)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(147, 51, 234, 0.7)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 0 10px rgba(147, 51, 234, 0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '200% 0%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
