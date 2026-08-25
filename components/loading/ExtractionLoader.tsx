"use client";

import { useEffect } from "react";

interface ExtractionLoaderProps {
  onDone: () => void;
}

export default function ExtractionLoader({ onDone }: ExtractionLoaderProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Sparkle stars */}
      <div className="relative">
        <svg
          viewBox="0 0 80 80"
          className="size-20 animate-veda-pulse"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="sparkGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#FF633D" />
              <stop offset="100%" stopColor="#FF8F7A" />
            </linearGradient>
          </defs>
          <path
            d="M40 4 L46 32 L74 40 L46 48 L40 76 L34 48 L6 40 L34 32 Z"
            fill="url(#sparkGrad)"
          />
        </svg>
        <svg
          viewBox="0 0 32 32"
          className="absolute -right-3 -top-2 size-8 animate-veda-pulse-late opacity-80"
          aria-hidden="true"
        >
          <path
            d="M16 2 L19 12 L30 16 L19 20 L16 30 L13 20 L2 16 L13 12 Z"
            fill="#FFB088"
          />
        </svg>
      </div>
      <p className="mt-6 text-lg font-semibold text-[--color-veda-dark]">
        Extracting...
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        This may take a while
      </p>
    </div>
  );
}
