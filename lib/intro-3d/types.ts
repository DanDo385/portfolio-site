export const INTRO_DURATION_MS = 5200;
export const INTRO_SKIP_FADE_MS = 280;
export const INTRO_STORAGE_KEY = 'magro-intro-seen';

export type IntroSceneId = 'liquidityLattice' | 'settlement' | 'macroField';

export const INTRO_SCENES: {
  id: IntroSceneId;
  label: string;
  eyebrow: string;
  detail: string;
  beats: string[];
}[] = [
  {
    id: 'liquidityLattice',
    label: 'Depth of Market',
    eyebrow: 'ETH-USD',
    detail: 'Bid / ask ladder · last print · spread',
    beats: ['ORDER BOOK', 'LAST  3247.50', 'SPREAD  0.50'],
  },
  {
    id: 'settlement',
    label: 'Settlement Pipeline',
    eyebrow: 'ETH · FINALITY',
    detail: 'Mempool → inclusion → attested → finalized',
    beats: ['STATUS  PENDING', 'STATUS  INCLUDED', 'FINALITY  CONFIRMED'],
  },
  {
    id: 'macroField',
    label: 'Yield Curve',
    eyebrow: 'USD RATES',
    detail: 'Market curve vs fair value · 2s10s',
    beats: ['USD RATES', '10Y  4.18%', '2s10s  -44bp'],
  },
];

export type IntroSceneController = {
  start: () => void;
  skip: () => void;
  destroy: () => void;
  resize: () => void;
};

export function pickRandomIntroScene(): (typeof INTRO_SCENES)[number] {
  const i = Math.floor(Math.random() * INTRO_SCENES.length);
  return INTRO_SCENES[i]!;
}
