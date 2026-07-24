import type { MarketOutcome, Stance } from './types';

export const CORRECT_CALL_COPY = 'GREAT CALL!';
export const WRONG_CALL_COPY = 'STOPPED OUT!';

export const OUTCOME_COPY: Record<
  MarketOutcome,
  { primary: string; videoSrc: string }
> = {
  rally: {
    primary: 'OFFERS LIFTED',
    videoSrc: '/videos/bull-wins.mp4',
  },
  crash: {
    primary: 'BIDS WIPED',
    videoSrc: '/videos/bear-wins.mp4',
  },
};

export function stanceMatchesOutcome(stance: Stance, outcome: MarketOutcome): boolean {
  return (
    (stance === 'bullish' && outcome === 'rally') ||
    (stance === 'bearish' && outcome === 'crash')
  );
}
