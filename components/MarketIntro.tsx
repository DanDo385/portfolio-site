'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createIntroScene,
  pickRandomIntroScene,
  type IntroSceneController,
} from '@/lib/intro-3d';

type Phase = 'pending' | 'playing' | 'exiting' | 'gone';

function shouldPlayIntro(): boolean {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return true;
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

    const controller = createIntroScene(meta.id, canvas, rootRef.current, finish);
    controllerRef.current = controller;
    controller.start();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        controller.skip();
      }
    };
    const onResize = () => controller.resize();
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    requestAnimationFrame(() => skipRef.current?.focus());

    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      controller.destroy();
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
      <div className="market-intro-chrome">
        <div>
          <p className="market-intro-eyebrow">{meta.eyebrow}</p>
          <p className="market-intro-scene-label">{meta.label}</p>
          <p className="market-intro-scene-detail">{meta.detail}</p>
        </div>
        <button
          ref={skipRef}
          type="button"
          className="market-intro-skip"
          onClick={() => controllerRef.current?.skip()}
        >
          Skip
        </button>
      </div>
    </div>
  );
}
