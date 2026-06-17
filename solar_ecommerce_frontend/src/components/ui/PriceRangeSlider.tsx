'use client';

import { useEffect, useId, useRef, useState } from 'react';
import clsx from 'clsx';

interface PriceRangeSliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatLabel?: (n: number) => string;
  className?: string;
}

/**
 * Accessible dual-range price slider built on two <input type="range"> with
 * a visible filled track. No external deps.
 */
export function PriceRangeSlider({
  min,
  max,
  step = 1,
  value,
  onChange,
  formatLabel = (n) => n.toLocaleString(),
  className,
}: PriceRangeSliderProps) {
  const id = useId();
  const [low, high] = value;
  const trackRef = useRef<HTMLDivElement>(null);
  const [pct, setPct] = useState({ low: 0, high: 100 });

  useEffect(() => {
    const span = max - min || 1;
    setPct({
      low: ((low - min) / span) * 100,
      high: ((high - min) / span) * 100,
    });
  }, [low, high, min, max]);

  const update = (next: [number, number]) => {
    const [a, b] = next;
    if (a <= b) onChange([a, b]);
  };

  return (
    <div className={clsx('w-full', className)}>
      <div className="relative h-6">
        <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-slate-200" ref={trackRef} />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-amber-500"
          style={{ left: `${pct.low}%`, right: `${100 - pct.high}%` }}
        />
        <input
          id={`${id}-min`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => update([Math.min(Number(e.target.value), high), high])}
          aria-label="Minimum price"
          className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow"
        />
        <input
          id={`${id}-max`}
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => update([low, Math.max(Number(e.target.value), low)])}
          aria-label="Maximum price"
          className="pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-amber-500 [&::-webkit-slider-thumb]:shadow"
        />
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
        <span>₹ {formatLabel(low)}</span>
        <span>₹ {formatLabel(high)}</span>
      </div>
    </div>
  );
}
