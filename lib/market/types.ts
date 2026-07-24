export type Stance = 'bullish' | 'bearish';

/** Coin-flip outcome. Independent of the user's stance. */
export type MarketOutcome = 'rally' | 'crash';

export type BookSide = 'bid' | 'ask';

export type BookLevel = {
  side: BookSide;
  /** Distance from touch (0 = best). */
  rank: number;
  price: number;
  size: number;
};

export type PriceTick = {
  time: number;
  value: number;
};

export type SimulationSnapshot = {
  mid: number;
  levels: BookLevel[];
  lastTick: PriceTick;
};

export type SimulationPhase = 'idle' | 'running' | 'event' | 'done';

export const ASSET_NAME = 'S&P 500 Index';
export const INTRO_STORAGE_KEY = 'magro-intro-seen';
