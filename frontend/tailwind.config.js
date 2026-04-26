/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        surface: {
          DEFAULT: 'rgba(255,255,255,0.05)',
          hover: 'rgba(255,255,255,0.08)',
        },
        bg: '#0B0F19',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'bounce-dot': 'bounceDot 1.2s infinite ease-in-out',
        'pulse-slow': 'pulse 3s infinite',
        'orb-float': 'orbFloat 8s ease-in-out infinite',
      },
      keyframes: {
        bounceDot: {
          '0%, 80%, 100%': { transform: 'scale(0)', opacity: '0.3' },
          '40%': { transform: 'scale(1)', opacity: '1' },
        },
        orbFloat: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -20px) scale(1.05)' },
          '66%': { transform: 'translate(-10px, 10px) scale(0.95)' },
        },
      },
    },
  },
  plugins: [],
};
