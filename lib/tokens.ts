export const tokens = {
  colors: {
    bg: '#0c0a08',
    bg2: '#141210',
    bg3: '#1c1915',
    primary: '#c9a96e',
    primary2: '#b8924f',
    text: '#f5f0e8',
    muted: 'rgba(245,240,232,0.45)',
    border: 'rgba(201,169,110,0.18)',
    green: '#4ade80',
    red: '#f87171',
    blue: '#60a5fa',
    purple: '#a78bfa',
  },
  fonts: {
    heading: 'Cormorant Garamond',
    body: 'Inter',
    arabic: 'Noto Sans Arabic',
  },
  platformColors: {
    airbnb: '#FF5A5F',
    booking: '#4a90d9',
    gatherin: '#c9a96e',
    expedia: '#1d4e89',
    direct: '#c9a96e',
    blocked: '#a78bfa',
    manual: '#60a5fa',
  },
} as const;

export type Tokens = typeof tokens;
