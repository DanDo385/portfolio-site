'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { SentimentGate } from '@/components/market-intro/SentimentGate';
import { MarketTerminal } from '@/components/market-intro/MarketTerminal';
import { PassJoke } from '@/components/market-intro/PassJoke';
import { fetchDailyClosePrice } from '@/lib/market/fetchDailyClosePrice';
import {
  INTRO_STORAGE_KEY,
  type MarketOutcome,
  type Stance,
} from '@/lib/market/types';

type Phase = 'pending' | 'gate' | 'pass' | 'terminal' | 'exiting' | 'gone';

const REPLAY_EVERY_REFRESH = true;

function shouldPlayIntro(): boolean {
  if (!REPLAY_EVERY_REFRESH) {
    try {
      if (sessionStorage.getItem(INTRO_STORAGE_KEY)) return false;
    } catch {
      // sessionStorage may be unavailable
    }
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
}

function markIntroSeen() {
  if (REPLAY_EVERY_REFRESH) return;
  try {
    sessionStorage.setItem(INTRO_STORAGE_KEY, '1');
  } catch {
    // ignore
  }
}

function flipOutcome(): MarketOutcome {
  return Math.random() < 0.5 ? 'rally' : 'crash';
}

export function MarketIntro() {
  const [phase, setPhase] = useState<Phase>('pending');
  const [seedPrice, setSeedPrice] = useState(5234.18);
  const [outcome, setOutcome] = useState<MarketOutcome | null>(null);
  const [stance, setStance] = useState<Stance | null>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    markIntroSeen();
    setPhase('exiting');
    document.documentElement.classList.remove('intro-active');
    document.documentElement.classList.add('intro-done');
    window.setTimeout(() => {
      setPhase('gone');
      const top = document.getElementById('top');
      if (top instanceof HTMLElement) top.focus({ preventScroll: true });
    }, 280);
  }, []);

  useEffect(() => {
    if (!shouldPlayIntro()) {
      document.documentElement.classList.remove('intro-active');
      document.documentElement.classList.add('intro-skipped');
      setPhase('gone');
      return;
    }

    document.documentElement.classList.add('intro-active');
    document.documentElement.classList.remove('intro-done', 'intro-skipped');
    setPhase('gate');

    let cancelled = false;
    fetchDailyClosePrice('SPX').then((price) => {
      if (!cancelled) setSeedPrice(price);
    });

    return () => {
      cancelled = true;
      document.documentElement.classList.remove('intro-active');
    };
  }, []);

  useEffect(() => {
    if (phase !== 'gate') return;
    requestAnimationFrame(() => skipRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, finish]);

  const onSelect = (next: Stance) => {
    setStance(next);
    setOutcome(flipOutcome());
    setPhase('terminal');
  };

  if (phase === 'pending' || phase === 'gone') return null;

  return (
    <div
      className={`market-intro${phase === 'exiting' ? ' market-intro-exiting' : ''}`}
      role="dialog"
      aria-label="Market introduction"
      aria-modal="true"
    >
      <button
        ref={skipRef}
        type="button"
        className="market-intro-skip market-intro-skip-fixed"
        onClick={finish}
      >
        Skip
      </button>

      <AnimatePresence mode="wait">
        {phase === 'gate' && (
          <SentimentGate key="gate" onSelect={onSelect} onPass={() => setPhase('pass')} />
        )}
        {phase === 'pass' && (
          <PassJoke key="pass" onContinue={finish} />
        )}
        {(phase === 'terminal' || phase === 'exiting') && outcome && stance && (
          <MarketTerminal
            key="terminal"
            seedPrice={seedPrice}
            outcome={outcome}
            stance={stance}
            onComplete={finish}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
