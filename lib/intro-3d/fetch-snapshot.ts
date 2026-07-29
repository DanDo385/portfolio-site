import {
  FALLBACK_MARKET_SNAPSHOT,
  FRED_TENOR_SERIES,
  type BookLevel,
  type IntroMarketSnapshot,
  type YieldTenor,
} from './market-data';

type FredObservation = { date: string; value: string };

const UA = 'magro.dev-intro/1.0 (+https://magro.dev)';

async function fetchText(url: string, timeoutMs = 10000): Promise<string> {
  const res = await fetch(url, {
    headers: { accept: '*/*', 'user-agent': UA },
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

async function fetchJson<T>(url: string, timeoutMs = 10000): Promise<T> {
  const res = await fetch(url, {
    headers: { accept: 'application/json', 'user-agent': UA },
    signal: AbortSignal.timeout(timeoutMs),
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.json() as Promise<T>;
}

function latestNumeric(obs: FredObservation[]): { value: number; date: string } | null {
  for (const o of obs) {
    const n = Number(o.value);
    if (Number.isFinite(n)) return { value: n, date: o.date };
  }
  return null;
}

async function fetchFredSeries(
  seriesId: string,
  apiKey: string,
  limit: number
): Promise<FredObservation[]> {
  const url = new URL('https://api.stlouisfed.org/fred/series/observations');
  url.searchParams.set('series_id', seriesId);
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('file_type', 'json');
  url.searchParams.set('sort_order', 'desc');
  url.searchParams.set('limit', String(limit));

  const data = await fetchJson<{ observations?: FredObservation[] }>(url.toString(), 8000);
  return (data.observations ?? []).filter((o) => o.value !== '.' && o.value !== '');
}

async function fetchFredYields(
  apiKey: string
): Promise<{ yields: IntroMarketSnapshot['yields']; asOf: string } | null> {
  const results = await Promise.all(
    FRED_TENOR_SERIES.map(async (meta) => {
      const obs = await fetchFredSeries(meta.seriesId, apiKey, 8);
      const latest = latestNumeric(obs);
      return latest == null
        ? null
        : ({ ...meta, yld: latest.value, asOf: latest.date } as YieldTenor & { asOf: string });
    })
  );

  if (results.some((r) => r == null)) return null;
  const packed = results as (YieldTenor & { asOf: string })[];
  const tenors: YieldTenor[] = packed.map(({ asOf: _a, ...rest }) => rest);
  const tenY = tenors.find((t) => t.label === '10Y')!.yld;
  const twoY = tenors.find((t) => t.label === '2Y')!.yld;
  const spread2s10sBp = Math.round((tenY - twoY) * 100);
  const asOf = packed.find((t) => t.label === '10Y')?.asOf ?? packed[0]!.asOf;

  let tenYHistory: number[] = FALLBACK_MARKET_SNAPSHOT.yields.tenYHistory;
  try {
    const hist = await fetchFredSeries('DGS10', apiKey, 20);
    const vals = hist
      .map((o) => Number(o.value))
      .filter((n) => Number.isFinite(n))
      .reverse();
    if (vals.length >= 8) tenYHistory = vals;
  } catch {
    // keep fallback history
  }

  return {
    asOf,
    yields: { tenors, tenY, twoY, spread2s10sBp, tenYHistory },
  };
}

/** Official Daily Treasury Par Yield Curve (prior business-day closes). No API key. */
async function fetchTreasuryGovYields(): Promise<{
  yields: IntroMarketSnapshot['yields'];
  asOf: string;
} | null> {
  try {
    const month = new Date().toISOString().slice(0, 7).replace('-', '');
    const html = await fetchText(
      `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?type=daily_treasury_yield_curve&field_tdr_date_value_month=${month}`,
      12000
    );

    const rows = html.split(/<tr\b/i);
    const parsed: { asOf: string; map: Record<string, number> }[] = [];

    for (const row of rows) {
      if (!row.includes('field-bc-10year') || !row.includes('field-tdr-date')) continue;
      const dateMatch =
        row.match(/<time[^>]*datetime="([^"]+)"/i) || row.match(/(\d{2}\/\d{2}\/\d{4})/);
      if (!dateMatch) continue;

      const cell = (cls: string) => {
        const m = row.match(new RegExp(`field-${cls}[^>]*>([^<]+)<`, 'i'));
        const raw = m?.[1]?.trim();
        if (!raw || raw === 'N/A') return null;
        const n = Number(raw);
        return Number.isFinite(n) ? n : null;
      };

      const map: Record<string, number> = {};
      const pairs: [string, string][] = [
        ['1M', 'bc-1month'],
        ['3M', 'bc-3month'],
        ['6M', 'bc-6month'],
        ['2Y', 'bc-2year'],
        ['5Y', 'bc-5year'],
        ['10Y', 'bc-10year'],
        ['20Y', 'bc-20year'],
        ['30Y', 'bc-30year'],
      ];
      for (const [label, cls] of pairs) {
        const v = cell(cls);
        if (v != null) map[label] = v;
      }
      if (map['10Y'] == null || map['2Y'] == null) continue;

      const rawDate = dateMatch[1]!;
      const asOf = rawDate.includes('T')
        ? rawDate.slice(0, 10)
        : rawDate.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, '$3-$1-$2');
      parsed.push({ asOf, map });
    }

    if (!parsed.length) return null;
    const latest = parsed[parsed.length - 1]!;
    const tenors: YieldTenor[] = FRED_TENOR_SERIES.map((meta) => ({
      ...meta,
      yld: latest.map[meta.label] ?? FALLBACK_MARKET_SNAPSHOT.yields.tenors.find((t) => t.label === meta.label)!.yld,
    }));
    const tenY = latest.map['10Y']!;
    const twoY = latest.map['2Y']!;
    const tenYHistory = parsed.map((p) => p.map['10Y']!).filter((n) => Number.isFinite(n));

    return {
      asOf: latest.asOf,
      yields: {
        tenors,
        tenY,
        twoY,
        spread2s10sBp: Math.round((tenY - twoY) * 100),
        tenYHistory: tenYHistory.length >= 5 ? tenYHistory : FALLBACK_MARKET_SNAPSHOT.yields.tenYHistory,
      },
    };
  } catch {
    return null;
  }
}

/** Coinbase daily candle: [time, low, high, open, close, volume], newest first. */
type CbCandle = [number, number, number, number, number, number];

async function fetchCoinbasePriorClose(product: string): Promise<{
  close: number;
  asOf: string;
  changePct: number;
} | null> {
  try {
    const candles = await fetchJson<CbCandle[]>(
      `https://api.exchange.coinbase.com/products/${product}/candles?granularity=86400`,
      8000
    );
    if (!Array.isArray(candles) || candles.length < 2) return null;
    // [0] is the in-progress day; [1] is the last completed daily close.
    const prior = candles[1]!;
    const before = candles[2];
    const close = prior[4];
    const prev = before?.[4];
    if (!Number.isFinite(close) || close <= 0) return null;
    const changePct =
      prev && Number.isFinite(prev) && prev > 0 ? ((close - prev) / prev) * 100 : 0;
    const asOf = new Date(prior[0] * 1000).toISOString().slice(0, 10);
    return { close, asOf, changePct: Number(changePct.toFixed(2)) };
  } catch {
    return null;
  }
}

function buildSyntheticBook(mid: number, tick: number, levels = 12): {
  bids: BookLevel[];
  asks: BookLevel[];
} {
  const bids: BookLevel[] = [];
  const asks: BookLevel[] = [];
  for (let i = 0; i < levels; i++) {
    const size = Math.max(0.4, 14 - i * 0.85 + ((i * 17) % 5) * 0.35);
    bids.push({
      price: Number((mid - tick * (i + 1)).toFixed(2)),
      size: Number(size.toFixed(2)),
    });
    asks.push({
      price: Number((mid + tick * (i + 1)).toFixed(2)),
      size: Number((size * 0.92).toFixed(2)),
    });
  }
  return { bids, asks };
}

function compressBook(
  rows: [string, string][] | undefined,
  side: 'bid' | 'ask',
  mid: number,
  tick: number
): BookLevel[] {
  const levels: BookLevel[] = [];
  const buckets = new Map<number, number>();
  for (const [p, s] of rows ?? []) {
    const price = Number(p);
    const size = Number(s);
    if (!Number.isFinite(price) || !Number.isFinite(size)) continue;
    const bucket =
      side === 'bid' ? Math.floor(price / tick) * tick : Math.ceil(price / tick) * tick;
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + size);
  }
  const sorted = [...buckets.entries()].sort((a, b) =>
    side === 'bid' ? b[0] - a[0] : a[0] - b[0]
  );
  for (const [price, size] of sorted.slice(0, 12)) {
    levels.push({
      price: Number(price.toFixed(2)),
      size: Number(Math.min(size, 80).toFixed(2)),
    });
  }
  while (levels.length < 12) {
    const last = levels[levels.length - 1];
    const price =
      side === 'bid' ? (last?.price ?? mid) - tick : (last?.price ?? mid) + tick;
    levels.push({ price: Number(price.toFixed(2)), size: 0.5 });
  }
  return levels;
}

async function fetchEthMarket(): Promise<{
  eth: IntroMarketSnapshot['eth'];
  asOf: string;
  live: boolean;
} | null> {
  const prior = await fetchCoinbasePriorClose('ETH-USD');
  if (!prior) return null;

  const tick = 0.5;
  let bids: BookLevel[] | null = null;
  let asks: BookLevel[] | null = null;
  let usedLiveBook = false;

  try {
    const [bookRes, tickerRes] = await Promise.all([
      fetch('https://api.exchange.coinbase.com/products/ETH-USD/book?level=2', {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(6000),
        headers: { accept: 'application/json', 'user-agent': UA },
      }),
      fetch('https://api.exchange.coinbase.com/products/ETH-USD/ticker', {
        next: { revalidate: 120 },
        signal: AbortSignal.timeout(6000),
        headers: { accept: 'application/json', 'user-agent': UA },
      }),
    ]);

    if (bookRes.ok && tickerRes.ok) {
      const book = (await bookRes.json()) as {
        bids?: [string, string][];
        asks?: [string, string][];
      };
      const ticker = (await tickerRes.json()) as { price?: string };
      const liveMid = Number(ticker.price);
      // Only reuse live L2 sizes when the market is still near the prior close.
      if (
        Number.isFinite(liveMid) &&
        liveMid > 0 &&
        Math.abs(liveMid - prior.close) / prior.close < 0.015
      ) {
        bids = compressBook(book.bids, 'bid', prior.close, tick);
        asks = compressBook(book.asks, 'ask', prior.close, tick);
        usedLiveBook = true;
      }
    }
  } catch {
    // synthetic book below
  }

  if (!bids || !asks) {
    const synth = buildSyntheticBook(prior.close, tick);
    bids = synth.bids;
    asks = synth.asks;
  }

  const bidNotionalM =
    Math.round((bids.reduce((a, l) => a + l.price * l.size, 0) / 1_000_000) * 100) / 100;
  const askNotionalM =
    Math.round((asks.reduce((a, l) => a + l.price * l.size, 0) / 1_000_000) * 100) / 100;

  return {
    live: usedLiveBook,
    asOf: prior.asOf,
    eth: {
      mid: Number(prior.close.toFixed(2)),
      changePct: prior.changePct,
      tick,
      bids,
      asks,
      bidNotionalM: Math.max(0.1, bidNotionalM),
      askNotionalM: Math.max(0.1, askNotionalM),
    },
  };
}

async function fetchMarks(): Promise<IntroMarketSnapshot['marks'] | null> {
  const [btc, sol] = await Promise.all([
    fetchCoinbasePriorClose('BTC-USD'),
    fetchCoinbasePriorClose('SOL-USD'),
  ]);
  if (!btc || !sol) return null;
  return { btc: Math.round(btc.close), sol: Number(sol.close.toFixed(2)) };
}

export async function buildIntroMarketSnapshot(): Promise<IntroMarketSnapshot> {
  const fredKey = process.env.FRED_API_KEY?.trim();
  const base = structuredClone(FALLBACK_MARKET_SNAPSHOT);
  let source: IntroMarketSnapshot['source'] = 'fallback';
  let asOf = base.asOf;

  const [fredPack, treasuryPack, ethPack, marks] = await Promise.all([
    fredKey ? fetchFredYields(fredKey).catch(() => null) : Promise.resolve(null),
    fetchTreasuryGovYields().catch(() => null),
    fetchEthMarket(),
    fetchMarks(),
  ]);

  if (fredPack) {
    base.yields = fredPack.yields;
    asOf = fredPack.asOf;
    source = 'fred';
  } else if (treasuryPack) {
    base.yields = treasuryPack.yields;
    asOf = treasuryPack.asOf;
    source = 'treasury';
  }

  if (ethPack) {
    base.eth = ethPack.eth;
    if (source === 'fred') source = 'fred+coinbase';
    else if (source === 'treasury') source = 'treasury+coinbase';
    else source = ethPack.live ? 'coinbase' : 'prior-close';
    // Keep yield asOf when yields came from FRED/Treasury; otherwise use ETH prior close date.
    if (source === 'coinbase' || source === 'prior-close') asOf = ethPack.asOf;
  }

  if (marks) base.marks = marks;

  return { ...base, asOf, source };
}
