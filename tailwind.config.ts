import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Sampled directly from the Koink logo.
        koink: {
          yellow: '#fcc802',
          'yellow-soft': '#ffe27a',
          ink: '#020106',
          'ink-soft': '#141018',
          paper: '#fdfaf3'
        }
      },
      fontFamily: {
        // Loaded via Google Fonts <link> in index.html.
        display: ['"Fredoka"', 'ui-rounded', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        blob: '2.5rem'
      },
      boxShadow: {
        koink: '0 12px 40px -12px rgba(2, 1, 6, 0.35)'
      },
      keyframes: {
        'float-y': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' }
        }
      },
      animation: {
        'float-y': 'float-y 4s ease-in-out infinite'
      }
    }
  },
  plugins: []
} satisfies Config
