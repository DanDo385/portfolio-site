'use client';

import { motion } from 'framer-motion';
import type { Stance } from '@/lib/market/types';

type SentimentGateProps = {
  onSelect: (stance: Stance) => void;
  onPass: () => void;
  disabled?: boolean;
};

export function SentimentGate({ onSelect, onPass, disabled }: SentimentGateProps) {
  return (
    <motion.div
      className="sentiment-gate"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
    >
      <p className="sentiment-gate-eyebrow">MAGRO · MARKETS</p>
      <h2 className="sentiment-gate-title">What&apos;s your stance on the market today?</h2>
      <p className="sentiment-gate-sub">
        Choose a side. Liquidity decides the rest.
      </p>
      <div className="sentiment-gate-cards">
        <button
          type="button"
          className="sentiment-card sentiment-card-bull"
          disabled={disabled}
          onClick={() => onSelect('bullish')}
        >
          <span className="sentiment-card-label">Bullish</span>
          <span className="sentiment-card-hint">Risk on</span>
        </button>
        <button
          type="button"
          className="sentiment-card sentiment-card-bear"
          disabled={disabled}
          onClick={() => onSelect('bearish')}
        >
          <span className="sentiment-card-label">Bearish</span>
          <span className="sentiment-card-hint">Risk off</span>
        </button>
      </div>
      <button
        type="button"
        className="sentiment-pass"
        disabled={disabled}
        onClick={onPass}
      >
        No thanks, I&apos;ll Pass
      </button>
    </motion.div>
  );
}
