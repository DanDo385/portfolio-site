export const INTRO_DURATION_MS = 4500;
export const INTRO_SKIP_FADE_MS = 280;
export const INTRO_STORAGE_KEY = 'magro-intro-seen';

export type IntroSceneId =
  | 'liquidityLattice'
  | 'dualRail'
  | 'settlement'
  | 'agentBoot'
  | 'macroField';

export const INTRO_SCENES: {
  id: IntroSceneId;
  label: string;
  eyebrow: string;
  detail: string;
}[] = [
  {
    id: 'liquidityLattice',
    label: 'Depth of Market',
    eyebrow: 'ETH-USD',
    detail: 'Bid / ask ladder with last print',
  },
  {
    id: 'dualRail',
    label: 'Tape × Signal',
    eyebrow: 'ETH-USD · 1m',
    detail: 'Candles meet agent conviction scores',
  },
  {
    id: 'settlement',
    label: 'Settlement Pipeline',
    eyebrow: 'ETH · FINALITY',
    detail: 'Mempool → inclusion → finalized',
  },
  {
    id: 'agentBoot',
    label: 'Agent Desk',
    eyebrow: 'RUNTIME',
    detail: 'Chart context, DOM tool, act loop',
  },
  {
    id: 'macroField',
    label: 'Yield Curve',
    eyebrow: 'USD RATES',
    detail: 'Market curve vs fair value',
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
