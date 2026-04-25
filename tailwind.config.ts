import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf7',
          100: '#faf5eb',
          200: '#f5ebd6',
          300: '#f0e0c1',
          400: '#e8d0a3',
          500: '#d4b87a',
          600: '#b89552',
          700: '#9a753d',
          800: '#7d5e34',
          900: '#664c2d',
        },
        sertão: {
          50: '#f0f5e9',
          100: '#dceacc',
          200: '#bad599',
          300: '#8fbf66',
          400: '#6baa3d',
          500: '#4d9016',
          600: '#2d5016',
          700: '#284012',
          800: '#21300e',
          900: '#1a260b',
        },
        terra: {
          50: '#fdf8f3',
          100: '#f9ecd8',
          200: '#f3d9b1',
          300: '#ecc178',
          400: '#e6a83e',
          500: '#d68c16',
          600: '#8B4513',
          700: '#733910',
          800: '#5c2d0d',
          900: '#45230a',
        },
        ipê: {
          50: '#fff9e6',
          100: '#ffefb8',
          200: '#ffdf78',
          300: '#ffcf38',
          400: '#ffb800',
          500: '#cc9200',
          600: '#996c00',
          700: '#664900',
          800: '#332500',
          900: '#1a1300',
        },
      },
      fontFamily: {
        heading: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 300ms ease-out',
        'pulse-skeleton': 'pulseSkeleton 1.5s ease-in-out infinite',
        'bounce-in': 'bounceIn 400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSkeleton: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}

export default config