"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;       // e.g. "₹18,75,430" or "99.98%"
  duration?: number;
  className?: string;
}

function parseNumber(str: string) {
  return parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
}

export default function AnimatedCounter({ value, duration = 1400, className = "" }: AnimatedCounterProps) {
  const [display, setDisplay] = useState("0");
  const frameRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const target = parseNumber(value);

  // Extract prefix (₹) and suffix (%, ms etc.)
  const prefix = value.match(/^[₹$€£]/) ? value[0] : "";
  const suffix = value.match(/(%|ms|M\+|K\+)$/) ? value.match(/(%|ms|M\+|K\+)$/)![0] : "";

  useEffect(() => {
    let raf: number;
    const start = (ts: number) => {
      startRef.current = ts;
      const step = (ts: number) => {
        const elapsed = ts - startRef.current;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = target * eased;

        if (target > 1000) {
          setDisplay(Math.floor(current).toLocaleString("en-IN"));
        } else if (target < 10) {
          setDisplay(current.toFixed(1));
        } else {
          setDisplay(Math.floor(current).toString());
        }

        if (progress < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(start);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, target]);

  return (
    <span className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
