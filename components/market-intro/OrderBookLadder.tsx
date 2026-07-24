'use client';

import { useMemo } from 'react';
import type { BookLevel } from '@/lib/market/types';

type OrderBookLadderProps = {
  levels: BookLevel[];
  mid: number;
};

type LadderRow = {
  price: number;
  bidSize: number;
  askSize: number;
  volume: number;
  kind: 'ask' | 'bid' | 'inside';
};

function formatSize(n: number) {
  if (n <= 0) return '';
  return n.toLocaleString('en-US');
}

export function OrderBookLadder({ levels, mid }: OrderBookLadderProps) {
  const rows = useMemo(() => {
    const byPrice = new Map<number, LadderRow>();

    for (const level of levels) {
      const existing = byPrice.get(level.price) ?? {
        price: level.price,
        bidSize: 0,
        askSize: 0,
        volume: 0,
        kind: level.side === 'ask' ? 'ask' : 'bid',
      };
      if (level.side === 'ask') {
        existing.askSize = level.size;
        existing.kind = 'ask';
      } else {
        existing.bidSize = level.size;
        existing.kind = 'bid';
      }
      // Synthetic traded volume for the histogram column
      existing.volume = Math.max(
        existing.volume,
        Math.round((level.size + 40) * (18 - level.rank) * 11 + level.price % 97)
      );
      byPrice.set(level.price, existing);
    }

    const sorted = Array.from(byPrice.values()).sort((a, b) => b.price - a.price);

    // Mark the touch closest to mid as inside for highlight
    let bestAsk = Infinity;
    let bestBid = -Infinity;
    for (const row of sorted) {
      if (row.askSize > 0 && row.price < bestAsk) bestAsk = row.price;
      if (row.bidSize > 0 && row.price > bestBid) bestBid = row.price;
    }
    return sorted.map((row) => {
      if (row.price === bestAsk || row.price === bestBid) {
        return { ...row, kind: 'inside' as const };
      }
      return row;
    });
  }, [levels]);

  const maxBid = useMemo(() => Math.max(1, ...rows.map((r) => r.bidSize)), [rows]);
  const maxAsk = useMemo(() => Math.max(1, ...rows.map((r) => r.askSize)), [rows]);
  const maxVol = useMemo(() => Math.max(1, ...rows.map((r) => r.volume)), [rows]);

  const lastPrice = useMemo(() => {
    const inside = rows.find((r) => r.kind === 'inside' && r.bidSize > 0);
    return inside?.price ?? mid;
  }, [rows, mid]);

  return (
    <div className="dom-ladder">
      <div className="dom-ladder-head" aria-hidden="true">
        <span>Bid</span>
        <span>Price</span>
        <span>Ask</span>
        <span>Vol</span>
      </div>

      <div className="dom-ladder-body" role="table" aria-label="Depth of market ladder">
        {rows.map((row) => {
          const isLast = row.price === lastPrice;
          const wipedBid = row.bidSize <= 0 && row.kind !== 'ask';
          const wipedAsk = row.askSize <= 0 && row.kind !== 'bid';
          return (
            <div
              key={row.price}
              className={`dom-row${isLast ? ' dom-row-last' : ''}${row.kind === 'inside' ? ' dom-row-inside' : ''}`}
              role="row"
            >
              <div className={`dom-cell dom-bid${wipedBid && row.kind === 'bid' ? ' wiped' : ''}`}>
                <div
                  className="dom-bar dom-bar-bid"
                  style={{ width: `${(row.bidSize / maxBid) * 100}%` }}
                />
                <span className="dom-cell-value">{formatSize(row.bidSize)}</span>
              </div>

              <div
                className={`dom-cell dom-price${isLast ? ' dom-price-last' : ''}${
                  row.askSize > 0 && row.bidSize <= 0 ? ' dom-price-ask' : ''
                }${row.bidSize > 0 && row.askSize <= 0 ? ' dom-price-bid' : ''}`}
              >
                {row.price.toFixed(2)}
              </div>

              <div className={`dom-cell dom-ask${wipedAsk && row.kind === 'ask' ? ' wiped' : ''}`}>
                <div
                  className="dom-bar dom-bar-ask"
                  style={{ width: `${(row.askSize / maxAsk) * 100}%` }}
                />
                <span className="dom-cell-value">{formatSize(row.askSize)}</span>
              </div>

              <div className="dom-cell dom-vol">
                <div
                  className="dom-bar dom-bar-vol"
                  style={{ width: `${(row.volume / maxVol) * 100}%` }}
                />
                <span className="dom-cell-value dom-vol-value">{row.volume.toLocaleString('en-US')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dom-ladder-foot" aria-hidden="true">
        <span className="dom-mkt dom-mkt-buy">MKT</span>
        <span className="dom-last-chip">{mid.toFixed(2)}</span>
        <span className="dom-mkt dom-mkt-sell">MKT</span>
        <span className="dom-vol-label">VOL</span>
      </div>
    </div>
  );
}
