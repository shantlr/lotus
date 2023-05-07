import { random } from 'lodash';

export const LABEL_COLORS = {
  stone: {
    bg: '#a8a29e',
    outline: '#78716c',
  },
  red: {
    bg: '#f87171',
    outline: '#ef4444',
  },
  orange: {
    bg: '#fb923c',
    outline: '#f97316',
  },
  amber: {
    bg: '#fbbf24',
    outline: '#f59e0b',
  },
  lime: {
    bg: '#a3e635',
    outline: '#84cc16',
  },
  green: {
    bg: '#4ade80',
    outline: '#22c55e',
  },
  teal: {
    bg: '#2dd4bf',
    outline: '#14b8a6',
  },
  cyan: {
    bg: '#22d3ee',
    outline: '#06b6d4',
  },
  blue: {
    bg: '#60a5fa',
    outline: '#3b82f6',
  },
  indigo: {
    bg: '#818cf8',
    outline: '#6366f1',
  },
  violet: {
    bg: '#a78bfa',
    outline: '#8b5cf6',
  },
  fuschia: {
    bg: '#e879f9',
    outline: '#d946ef',
  },
  pink: {
    bg: '#f472b6',
    outline: '#ec4899',
  },
};

export const getRandomLabelColor = () => {
  const keys = Object.keys(
    LABEL_COLORS
  ) as any as (keyof typeof LABEL_COLORS)[];
  const idx = random(0, keys.length);
  return LABEL_COLORS[keys[idx]];
};
