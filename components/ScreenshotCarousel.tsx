'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ScreenshotCarouselProps {
  title: string;
  screenshots: string[];
}

export function ScreenshotCarousel({ title, screenshots }: ScreenshotCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const show = useCallback(
    (index: number) => {
      setCurrent((index + screenshots.length) % screenshots.length);
    },
    [screenshots.length]
  );

  useEffect(() => {
    if (screenshots.length <= 1 || paused || reducedMotion.current) return;
    const timer = setInterval(() => show(current + 1), 5000);
    return () => clearInterval(timer);
  }, [current, paused, screenshots.length, show]);

  if (screenshots.length === 0) {
    return (
      <div className="media-placeholder" role="img" aria-label={`Screenshot placeholder for ${title}`}>
        TODO(dan): screenshots
      </div>
    );
  }

  if (screenshots.length === 1) {
    return (
      <div className="carousel carousel-static">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={screenshots[0]} alt={`${title} screenshot`} loading="lazy" className="carousel-img" />
      </div>
    );
  }

  return (
    <div
      className="carousel"
      tabIndex={0}
      role="region"
      aria-label={`${title} screenshots`}
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          show(current - 1);
        }
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          show(current + 1);
        }
      }}
    >
      <div className="carousel-track">
        {screenshots.map((src, i) => (
          <div key={src} className={`carousel-slide${i === current ? ' active' : ''}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} screenshot ${i + 1}`} loading="lazy" className="carousel-img" />
          </div>
        ))}
      </div>
      <div className="carousel-dots" role="tablist" aria-label="Screenshot navigation">
        {screenshots.map((_, i) => (
          <button
            key={i}
            type="button"
            className={`carousel-dot${i === current ? ' active' : ''}`}
            role="tab"
            aria-selected={i === current}
            aria-label={`Screenshot ${i + 1}`}
            onClick={() => show(i)}
          />
        ))}
      </div>
    </div>
  );
}
