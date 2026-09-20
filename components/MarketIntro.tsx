'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createIntroScene,
  FALLBACK_MARKET_SNAPSHOT,
  pickRandomIntroScene,
  type IntroMarketSnapshot,
  type IntroSceneController,
} from '@/lib/intro-3d';

type Phase = 'pending' | 'playing' | 'exiting' | 'gone';

function shouldPlayIntro(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return new URLSearchParams(window.location.search).get('intro') === '1';
}

async function loadIntroSnapshot(): Promise<IntroMarketSnapshot> {
  try {
    const res = await fetch('/api/intro/snapshot', {
      signal: AbortSignal.timeout(2800),
    });
    if (!res.ok) return FALLBACK_MARKET_SNAPSHOT;
    const data = (await res.json()) as IntroMarketSnapshot;
    if (!data?.yields?.tenors?.length || !data?.eth?.mid) return FALLBACK_MARKET_SNAPSHOT;
    return data;
  } catch {
    return FALLBACK_MARKET_SNAPSHOT;
  }
}

export function MarketIntro() {
  const [phase, setPhase] = useState<Phase>('pending');
  const [meta] = useState(() => pickRandomIntroScene());
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);
  const controllerRef = useRef<IntroSceneController | null>(null);
  const finishedRef = useRef(false);

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
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
    setPhase('playing');

    return () => {
      document.documentElement.classList.remove('intro-active');
    };
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let controller: IntroSceneController | null = null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        finish();
      }
    };
    const onResize = () => controller?.resize();

    (async () => {
      const snapshot = await loadIntroSnapshot();
      if (cancelled) return;

      try {
        controller = createIntroScene(meta.id, canvas, rootRef.current, finish, snapshot);
        controllerRef.current = controller;
        controller.start();
        window.addEventListener('resize', onResize);
      } catch {
        // WebGL is optional. A renderer failure must never block the portfolio.
        finish();
      }
    })();

    window.addEventListener('keydown', onKey);
    skipRef.current?.focus();
    const fallback = window.setTimeout(finish, 18000);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, [phase, meta.id, finish]);

  if (phase === 'pending' || phase === 'gone') return null;

  return (
    <div
      ref={rootRef}
      className={`market-intro${phase === 'exiting' ? ' market-intro-exiting' : ''}`}
      role="dialog"
      aria-label="Site introduction"
      aria-modal="true"
    >
      <canvas ref={canvasRef} className="market-intro-canvas" aria-hidden="true" />
      <div className="market-intro-blackout" data-intro-blackout aria-hidden="true" />
      <div className="market-intro-vignette" aria-hidden="true" />
      <div className="market-intro-letterbox market-intro-letterbox-top" aria-hidden="true" />
      <div className="market-intro-letterbox market-intro-letterbox-bottom" aria-hidden="true" />
      <div className="market-intro-titlecard" data-intro-titlecard aria-hidden="true">
        <p className="market-intro-act" data-intro-act />
        <p className="market-intro-act-sub" data-intro-act-sub />
      </div>
      <div className="market-intro-chrome">
        <div className="market-intro-brand">
          <p className="market-intro-kicker">magro.dev</p>
          <p className="market-intro-eyebrow">{meta.eyebrow}</p>
          <p className="market-intro-scene-label">{meta.label}</p>
          <p className="market-intro-scene-detail">{meta.detail}</p>
        </div>
        <p className="market-intro-beat" data-intro-beat aria-live="polite" />
      </div>
      <button
        ref={skipRef}
        type="button"
        className="market-intro-skip"
        onClick={finish}
      >
        Skip
      </button>
    </div>
  );
}
