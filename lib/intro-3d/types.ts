/** ~9.2s leaves room for black bookends, title, assemble, insert, climax hold. */
export const INTRO_DURATION_MS = 9200;
export const INTRO_SKIP_FADE_MS = 280;
export const INTRO_STORAGE_KEY = 'magro-intro-seen';

export type IntroSceneId =
  | 'liquidityLattice'
  | 'settlement'
  | 'macroField'
  | 'programmableMoney';

export const INTRO_SCENES: {
  id: IntroSceneId;
  label: string;
  eyebrow: string;
  detail: string;
  beats: string[];
  coldTitle: string;
  coldSub: string;
}[] = [
  {
    id: 'liquidityLattice',
    label: 'Depth of Market',
    eyebrow: 'ETH-USD',
    detail: 'Bid / ask ladder · last print · spread',
    beats: ['ORDER BOOK', 'LAST', 'SPREAD'],
    coldTitle: 'DEPTH OF MARKET',
    coldSub: 'ETH-USD · DESK SNAPSHOT',
  },
  {
    id: 'settlement',
    label: 'Settlement Pipeline',
    eyebrow: 'ETH · FINALITY',
    detail: 'Mempool → inclusion → attested → finalized',
    beats: ['STATUS  PENDING', 'STATUS  INCLUDED', 'FINALITY  CONFIRMED'],
    coldTitle: 'SETTLEMENT',
    coldSub: 'MEMPOOL → FINALITY',
  },
  {
    id: 'macroField',
    label: 'Yield Curve',
    eyebrow: 'USD RATES',
    detail: 'Treasury curve · 2s10s · prior close / FRED',
    beats: ['USD RATES', '10Y', '2s10s'],
    coldTitle: 'YIELD CURVE',
    coldSub: 'USD TREASURY · AS OF',
  },
  {
    id: 'programmableMoney',
    label: 'Programmable Money',
    eyebrow: 'ATOMIC SETTLEMENT',
    detail: 'Legacy T+ rail vs on-chain claim',
    beats: ['T+1  RAIL', 'ON-CHAIN  CLAIM', 'ATOMIC  ·  FINAL'],
    coldTitle: 'PROGRAMMABLE MONEY',
    coldSub: 'LEGACY → ATOMIC',
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
