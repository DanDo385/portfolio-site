'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  BookLevel,
  MarketOutcome,
  PriceTick,
  SimulationPhase,
} from './types';

const LEVELS_PER_SIDE = 12;
const TICK_MS = 80;
const EVENT_DELAY_MS = 2500;
const TICK_SIZE = 0.25;

function buildBook(mid: number): BookLevel[] {
  const levels: BookLevel[] = [];
  for (let i = 0; i < LEVELS_PER_SIDE; i++) {
    const depthBias = Math.exp(-i * 0.22);
    levels.push({
      side: 'ask',
      rank: i,
      price: +(mid + TICK_SIZE * (i + 1)).toFixed(2),
      size: Math.round(40 + depthBias * 380 + Math.random() * 60),
    });
    levels.push({
      side: 'bid',
      rank: i,
      price: +(mid - TICK_SIZE * (i + 1)).toFixed(2),
      size: Math.round(40 + depthBias * 360 + Math.random() * 70),
    });
  }
  return levels;
}

function jitterSizes(levels: BookLevel[], mid: number): BookLevel[] {
  return levels.map((level) => {
    if (level.size <= 0) return level;
    const delta = Math.round((Math.random() - 0.48) * 28);
    const next = Math.max(8, level.size + delta);
    // Keep prices anchored to mid so the ladder breathes without drifting wildly
    const price =
      level.side === 'ask'
        ? +(mid + TICK_SIZE * (level.rank + 1)).toFixed(2)
        : +(mid - TICK_SIZE * (level.rank + 1)).toFixed(2);
    return { ...level, size: next, price };
  });
}

function walkMid(mid: number): number {
  const step = (Math.random() - 0.5) * 1.2;
  return +(mid + step).toFixed(2);
}

export type UseMarketSimulationOptions = {
  seedPrice: number;
  outcome: MarketOutcome;
  /** Seconds of calm tape before the triggered event. */
  calmMs?: number;
  onTick?: (tick: PriceTick) => void;
  onEventStart?: () => void;
};

export type UseMarketSimulationResult = {
  phase: SimulationPhase;
  mid: number;
  levels: BookLevel[];
  start: () => void;
  stop: () => void;
};

/**
 * High-frequency DOM + price simulation.
 * Price and book sizes live in refs; React state is throttled for the ladder UI.
 */
export function useMarketSimulation(
  options: UseMarketSimulationOptions
): UseMarketSimulationResult {
  const { seedPrice, outcome, calmMs = EVENT_DELAY_MS, onTick, onEventStart } =
    options;

  const midRef = useRef(seedPrice);
  const levelsRef = useRef<BookLevel[]>(buildBook(seedPrice));
  const phaseRef = useRef<SimulationPhase>('idle');
  const timerRef = useRef<number | null>(null);
  const eventTimerRef = useRef<number | null>(null);
  const uiTimerRef = useRef<number | null>(null);
  const burstRef = useRef<number | null>(null);
  const timeRef = useRef(Math.floor(Date.now() / 1000));
  const onTickRef = useRef(onTick);
  const onEventStartRef = useRef(onEventStart);

  const [phase, setPhase] = useState<SimulationPhase>('idle');
  const [mid, setMid] = useState(seedPrice);
  const [levels, setLevels] = useState<BookLevel[]>(() => buildBook(seedPrice));

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    onEventStartRef.current = onEventStart;
  }, [onEventStart]);

  const publishUi = useCallback(() => {
    setMid(midRef.current);
    setLevels(levelsRef.current.map((l) => ({ ...l })));
  }, []);

  const clearTimers = useCallback(() => {
    if (timerRef.current != null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (uiTimerRef.current != null) {
      window.clearInterval(uiTimerRef.current);
      uiTimerRef.current = null;
    }
    if (eventTimerRef.current != null) {
      window.clearTimeout(eventTimerRef.current);
      eventTimerRef.current = null;
    }
    if (burstRef.current != null) {
      window.clearInterval(burstRef.current);
      burstRef.current = null;
    }
  }, []);

  const runEvent = useCallback(() => {
    if (phaseRef.current !== 'running') return;
    phaseRef.current = 'event';
    setPhase('event');
    onEventStartRef.current?.();

    const mid0 = midRef.current;
    if (burstRef.current != null) {
      window.clearInterval(burstRef.current);
      burstRef.current = null;
    }

    if (outcome === 'rally') {
      levelsRef.current = levelsRef.current.map((level) =>
        level.side === 'ask' ? { ...level, size: 0 } : level
      );
      let step = 0;
      burstRef.current = window.setInterval(() => {
        step += 1;
        midRef.current = +(mid0 + step * 4.5).toFixed(2);
        timeRef.current += 1;
        const tick = { time: timeRef.current, value: midRef.current };
        onTickRef.current?.(tick);
        levelsRef.current = buildBook(midRef.current).map((level) =>
          level.side === 'ask' ? { ...level, size: 0 } : level
        );
        publishUi();
        if (step >= 8 && burstRef.current != null) {
          window.clearInterval(burstRef.current);
          burstRef.current = null;
        }
      }, 60);
    } else {
      levelsRef.current = levelsRef.current.map((level) =>
        level.side === 'bid' ? { ...level, size: 0 } : level
      );
      let step = 0;
      burstRef.current = window.setInterval(() => {
        step += 1;
        midRef.current = +(mid0 - step * 4.5).toFixed(2);
        timeRef.current += 1;
        const tick = { time: timeRef.current, value: midRef.current };
        onTickRef.current?.(tick);
        levelsRef.current = buildBook(midRef.current).map((level) =>
          level.side === 'bid' ? { ...level, size: 0 } : level
        );
        publishUi();
        if (step >= 8 && burstRef.current != null) {
          window.clearInterval(burstRef.current);
          burstRef.current = null;
        }
      }, 60);
    }
  }, [outcome, publishUi]);

  const start = useCallback(() => {
    clearTimers();
    midRef.current = seedPrice;
    levelsRef.current = buildBook(seedPrice);
    timeRef.current = Math.floor(Date.now() / 1000);
    phaseRef.current = 'running';
    setPhase('running');
    publishUi();

    // Seed chart with a short history
    for (let i = 40; i >= 0; i--) {
      const value = +(seedPrice + (Math.random() - 0.5) * 6).toFixed(2);
      onTickRef.current?.({ time: timeRef.current - i, value });
    }
    onTickRef.current?.({ time: timeRef.current, value: seedPrice });

    timerRef.current = window.setInterval(() => {
      if (phaseRef.current !== 'running') return;
      midRef.current = walkMid(midRef.current);
      levelsRef.current = jitterSizes(levelsRef.current, midRef.current);
      timeRef.current += 1;
      onTickRef.current?.({ time: timeRef.current, value: midRef.current });
    }, TICK_MS);

    // Throttle React ladder paints (~10fps) to avoid layout thrash
    uiTimerRef.current = window.setInterval(() => {
      if (phaseRef.current === 'idle' || phaseRef.current === 'done') return;
      publishUi();
    }, 100);

    eventTimerRef.current = window.setTimeout(runEvent, calmMs);
  }, [calmMs, clearTimers, publishUi, runEvent, seedPrice]);

  const stop = useCallback(() => {
    clearTimers();
    phaseRef.current = 'done';
    setPhase('done');
  }, [clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { phase, mid, levels, start, stop };
}
