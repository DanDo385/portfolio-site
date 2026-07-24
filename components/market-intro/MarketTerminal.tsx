'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OrderBookLadder } from './OrderBookLadder';
import { IntradayChart } from './IntradayChart';
import { useMarketSimulation } from '@/lib/market/useMarketSimulation';
import {
  CORRECT_CALL_COPY,
  OUTCOME_COPY,
  WRONG_CALL_COPY,
  stanceMatchesOutcome,
} from '@/lib/market/outcome';
import { ASSET_NAME, type MarketOutcome, type PriceTick, type Stance } from '@/lib/market/types';

type MarketTerminalProps = {
  seedPrice: number;
  outcome: MarketOutcome;
  stance: Stance;
  onComplete: () => void;
};

export function MarketTerminal({
  seedPrice,
  outcome,
  stance,
  onComplete,
}: MarketTerminalProps) {
  const [flash, setFlash] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const tickBridge = useRef<((tick: PriceTick) => void) | null>(null);
  const completing = useRef(false);

  const finish = useCallback(() => {
    if (completing.current) return;
    completing.current = true;
    onComplete();
  }, [onComplete]);

  const onTick = useCallback((tick: PriceTick) => {
    tickBridge.current?.(tick);
  }, []);

  const onEventStart = useCallback(() => {
    setFlash(true);
    setShowCopy(true);
    window.setTimeout(() => setFlash(false), 900);
    window.setTimeout(() => setShowVideo(true), 1200);
  }, []);

  const { phase, mid, levels, start, stop } = useMarketSimulation({
    seedPrice,
    outcome,
    calmMs: 2600,
    onTick,
    onEventStart,
  });

  useEffect(() => {
    start();
    return () => stop();
  }, [start, stop]);

  useEffect(() => {
    if (!showVideo || !videoFailed) return;
    const t = window.setTimeout(finish, 1600);
    return () => window.clearTimeout(t);
  }, [showVideo, videoFailed, finish]);

  const copy = OUTCOME_COPY[outcome] ?? OUTCOME_COPY.rally;
  const calledIt = stanceMatchesOutcome(stance, outcome);
  const accent =
    phase === 'event' || phase === 'done'
      ? outcome === 'rally'
        ? 'rally'
        : 'crash'
      : 'neutral';

  return (
    <motion.div
      className={`market-terminal market-terminal-${outcome}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <header className="market-terminal-bar">
        <div>
          <p className="market-terminal-asset">{ASSET_NAME}</p>
          <p className="market-terminal-meta">DEPTH · INTRADAY · SIMULATED</p>
        </div>
        <p className="market-terminal-last">
          LAST <strong>{mid.toFixed(2)}</strong>
        </p>
      </header>

      <div className="market-terminal-split">
        <section className="market-terminal-pane" aria-label="Order book">
          <p className="market-terminal-pane-label">Order Book</p>
          <OrderBookLadder levels={levels} mid={mid} />
        </section>
        <section className="market-terminal-pane" aria-label="Intraday chart">
          <p className="market-terminal-pane-label">Intraday</p>
          <IntradayChart tickRef={tickBridge} accent={accent} />
        </section>
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            key="flash"
            className={`market-flash market-flash-${outcome}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.15, 1, 0.2, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, times: [0, 0.12, 0.28, 0.44, 0.6, 0.76, 1] }}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCopy && (
          <motion.div
            className="market-event-copy"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <p className={`market-event-primary market-event-${outcome}`}>{copy.primary}</p>
            <p
              className={`market-event-secondary${calledIt ? ' market-event-secondary-win' : ' market-event-secondary-loss'}`}
            >
              {calledIt ? CORRECT_CALL_COPY : WRONG_CALL_COPY}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVideo && !videoFailed && (
          <motion.div
            className="market-video-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <video
              className="market-video"
              src={copy.videoSrc}
              autoPlay
              muted
              playsInline
              onEnded={finish}
              onError={() => setVideoFailed(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
