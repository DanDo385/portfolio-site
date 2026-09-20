'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Load WebGL code only when a visitor explicitly opens the visualization.
const MarketIntro = dynamic(() => import('./MarketIntro').then((module) => module.MarketIntro), { ssr: false });

export function OptionalMarketIntro() {
  const [requested, setRequested] = useState(false);
  useEffect(() => {
    setRequested(new URLSearchParams(window.location.search).get('intro') === '1' &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  return requested ? <MarketIntro /> : null;
}
