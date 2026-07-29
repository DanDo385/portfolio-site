/** Shared market snapshot for cinematic intro trailers. */

export type YieldTenor = {
  label: string;
  months: number;
  seriesId: string;
  yld: number;
};

export type BookLevel = {
  price: number;
  size: number;
};

export type IntroMarketSnapshot = {
  asOf: string;
  source: 'fred+coinbase' | 'treasury+coinbase' | 'fred' | 'treasury' | 'coinbase' | 'prior-close' | 'fallback';
  yields: {
    tenors: YieldTenor[];
    tenY: number;
    twoY: number;
    spread2s10sBp: number;
    /** Recent 10Y path for history trail (oldest → newest). */
    tenYHistory: number[];
  };
  eth: {
    mid: number;
    changePct: number;
    tick: number;
    bids: BookLevel[];
    asks: BookLevel[];
    bidNotionalM: number;
    askNotionalM: number;
  };
  marks: {
    btc: number;
    sol: number;
  };
};

export const FRED_TENOR_SERIES: { label: string; months: number; seriesId: string }[] = [
  { label: '1M', months: 1, seriesId: 'DGS1MO' },
  { label: '3M', months: 3, seriesId: 'DGS3MO' },
  { label: '6M', months: 6, seriesId: 'DGS6MO' },
  { label: '2Y', months: 24, seriesId: 'DGS2' },
  { label: '5Y', months: 60, seriesId: 'DGS5' },
  { label: '10Y', months: 120, seriesId: 'DGS10' },
  { label: '20Y', months: 240, seriesId: 'DGS20' },
  { label: '30Y', months: 360, seriesId: 'DGS30' },
];

/** Committed desk snapshot used when all live/prior-close fetches fail. */
export const FALLBACK_MARKET_SNAPSHOT: IntroMarketSnapshot = {
  asOf: '2026-07-27',
  source: 'fallback',
  yields: {
    tenors: [
      { label: '1M', months: 1, seriesId: 'DGS1MO', yld: 3.8 },
      { label: '3M', months: 3, seriesId: 'DGS3MO', yld: 3.96 },
      { label: '6M', months: 6, seriesId: 'DGS6MO', yld: 4.1 },
      { label: '2Y', months: 24, seriesId: 'DGS2', yld: 4.31 },
      { label: '5Y', months: 60, seriesId: 'DGS5', yld: 4.4 },
      { label: '10Y', months: 120, seriesId: 'DGS10', yld: 4.65 },
      { label: '20Y', months: 240, seriesId: 'DGS20', yld: 5.15 },
      { label: '30Y', months: 360, seriesId: 'DGS30', yld: 5.12 },
    ],
    tenY: 4.65,
    twoY: 4.31,
    spread2s10sBp: 34,
    tenYHistory: [
      4.48, 4.49, 4.52, 4.55, 4.58, 4.6, 4.57, 4.59, 4.61, 4.63, 4.62, 4.64, 4.66, 4.64, 4.65,
    ],
  },
  eth: {
    mid: 1890.67,
    changePct: -3.19,
    tick: 0.5,
    bids: buildSyntheticBook(1890.67, 0.5, 12, 'bid'),
    asks: buildSyntheticBook(1890.67, 0.5, 12, 'ask'),
    bidNotionalM: 1.18,
    askNotionalM: 1.05,
  },
  marks: {
    btc: 63694,
    sol: 74.13,
  },
};

function buildSyntheticBook(
  mid: number,
  tick: number,
  levels: number,
  side: 'bid' | 'ask'
): BookLevel[] {
  const out: BookLevel[] = [];
  for (let i = 0; i < levels; i++) {
    const price = side === 'bid' ? mid - tick * (i + 1) : mid + tick * (i + 1);
    const size = Math.max(0.4, 14 - i * 0.85 + ((i * 17) % 5) * 0.35);
    out.push({ price: Number(price.toFixed(2)), size: Number(size.toFixed(2)) });
  }
  return out;
}

export function formatAsOf(asOf: string): string {
  // YYYY-MM-DD → compact desk stamp
  const m = asOf.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return asOf.toUpperCase();
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export function formatYieldBeat(tenY: number, spreadBp: number): { tenY: string; spread: string } {
  const sign = spreadBp > 0 ? '+' : '';
  return {
    tenY: `10Y  ${tenY.toFixed(2)}%`,
    spread: `2s10s  ${sign}${spreadBp.toFixed(0)}bp`,
  };
}

export function formatDepthTape(
  eth: IntroMarketSnapshot['eth'],
  marks: IntroMarketSnapshot['marks'],
  tenY: number
): string {
  const sign = eth.changePct >= 0 ? '+' : '';
  return `ETH-USD  ${eth.mid.toFixed(2)}  ${sign}${eth.changePct.toFixed(2)}%   ·   BTC  ${marks.btc.toLocaleString('en-US')}   ·   SOL  ${marks.sol.toFixed(2)}   ·   US10Y  ${tenY.toFixed(2)}%`;
}

/** Deterministic fair-value ribbon: small parallel + twist vs market. */
export function fairValueYields(tenors: YieldTenor[]): number[] {
  return tenors.map((t, i) => {
    const twist = (i - (tenors.length - 1) / 2) * 0.018;
    return Number((t.yld + 0.04 + twist).toFixed(3));
  });
}
