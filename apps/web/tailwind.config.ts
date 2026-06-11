import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design system from the landing page prototype
        abyss: '#06121F',
        'abyss-2': '#0A1B2E',
        fog: '#9FB4C8',
        snow: '#EFF6FB',
        sonar: '#2BD9C2',
        coral: '#FF5C45',
        amber: '#F2B544',
      },
      fontFamily: {
        display: ['Archivo', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
