'use client';

import { useEffect, useRef, type MutableRefObject } from 'react';
import {
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type Time,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { PriceTick } from '@/lib/market/types';

type IntradayChartProps = {
  /** Imperative handle: parent pushes ticks without re-rendering the chart tree. */
  tickRef: MutableRefObject<((tick: PriceTick) => void) | null>;
  accent?: 'neutral' | 'rally' | 'crash';
};

export function IntradayChart({ tickRef, accent = 'neutral' }: IntradayChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      layout: {
        background: { type: ColorType.Solid, color: '#050810' },
        textColor: '#5a6a8a',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(26, 37, 64, 0.7)' },
        horzLines: { color: 'rgba(26, 37, 64, 0.7)' },
      },
      rightPriceScale: {
        borderColor: '#1a2540',
        scaleMargins: { top: 0.12, bottom: 0.12 },
      },
      timeScale: {
        borderColor: '#1a2540',
        timeVisible: true,
        secondsVisible: true,
      },
      crosshair: {
        vertLine: { color: 'rgba(201, 147, 58, 0.35)', width: 1 },
        horzLine: { color: 'rgba(201, 147, 58, 0.35)', width: 1 },
      },
      width: el.clientWidth,
      height: el.clientHeight,
    });

    const series = chart.addSeries(LineSeries, {
      color: '#c9933a',
      lineWidth: 2,
      lastValueVisible: true,
      priceLineVisible: true,
      priceLineColor: 'rgba(201, 147, 58, 0.45)',
    });

    chartRef.current = chart;
    seriesRef.current = series;

    tickRef.current = (tick: PriceTick) => {
      const point: LineData<Time> = {
        time: tick.time as UTCTimestamp,
        value: tick.value,
      };
      series.update(point);
      chart.timeScale().scrollToRealTime();
    };

    const onResize = () => {
      if (!containerRef.current || !chartRef.current) return;
      chartRef.current.applyOptions({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    return () => {
      tickRef.current = null;
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [tickRef]);

  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;
    if (accent === 'rally') {
      series.applyOptions({ color: '#2dd4a0', priceLineColor: 'rgba(45, 212, 160, 0.5)' });
    } else if (accent === 'crash') {
      series.applyOptions({ color: '#e11d48', priceLineColor: 'rgba(225, 29, 72, 0.5)' });
    } else {
      series.applyOptions({ color: '#c9933a', priceLineColor: 'rgba(201, 147, 58, 0.45)' });
    }
  }, [accent]);

  return <div ref={containerRef} className="intraday-chart" />;
}
