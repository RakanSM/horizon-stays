import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'hs-bg': '#0c0a08',
        'hs-bg2': '#141210',
        'hs-bg3': '#1c1915',
        'hs-primary': '#c9a96e',
        'hs-primary2': '#b8924f',
        'hs-text': '#f5f0e8',
        'hs-muted': 'rgba(245,240,232,0.45)',
        'hs-border': 'rgba(201,169,110,0.18)',
        'hs-green': '#4ade80',
        'hs-red': '#f87171',
        'hs-blue': '#60a5fa',
        'hs-purple': '#a78bfa',
      },
      fontFamily: {
        heading: ['var(--font-heading)'],
        body: ['var(--font-body)'],
        arabic: ['var(--font-arabic)'],
      },
    },
  },
  plugins: [],
};

export default config;
