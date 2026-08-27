"use client";

import { cn } from "@/lib/utils";
import type { AnswerRegion } from "@/types/exam";

const COLORS = [
  { border: "border-emerald-500/60", bg: "bg-emerald-400/20", selectedBorder: "border-emerald-500", selectedBg: "bg-emerald-400/35", ring: "ring-emerald-500/30", badge: "bg-emerald-500" },
  { border: "border-orange-500/60", bg: "bg-orange-400/20", selectedBorder: "border-orange-500", selectedBg: "bg-orange-400/35", ring: "ring-orange-500/30", badge: "bg-orange-500" },
  { border: "border-blue-500/60", bg: "bg-blue-400/20", selectedBorder: "border-blue-500", selectedBg: "bg-blue-400/35", ring: "ring-blue-500/30", badge: "bg-blue-500" },
  { border: "border-purple-500/60", bg: "bg-purple-400/20", selectedBorder: "border-purple-500", selectedBg: "bg-purple-400/35", ring: "ring-purple-500/30", badge: "bg-purple-500" },
  { border: "border-pink-500/60", bg: "bg-pink-400/20", selectedBorder: "border-pink-500", selectedBg: "bg-pink-400/35", ring: "ring-pink-500/30", badge: "bg-pink-500" },
  { border: "border-teal-500/60", bg: "bg-teal-400/20", selectedBorder: "border-teal-500", selectedBg: "bg-teal-400/35", ring: "ring-teal-500/30", badge: "bg-teal-500" },
];

function getColor(num: string) {
  const n = parseInt(num, 10) || 0;
  return COLORS[n % COLORS.length];
}

interface AnswerHighlightProps {
  questionNumber: string;
  region: AnswerRegion;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  setRef: (el: HTMLButtonElement | null) => void;
}

export default function AnswerHighlight({
  questionNumber,
  region,
  isSelected,
  hasSelection,
  onSelect,
  setRef,
}: AnswerHighlightProps) {
  const color = getColor(questionNumber);
  const { box } = region;

  return (
    <button
      ref={setRef}
      id={`highlight-q${questionNumber}`}
      aria-label={`Answer for Q${questionNumber}`}
      onClick={onSelect}
      className={cn(
        "absolute rounded-md border-2 transition-all duration-200",
        isSelected && "ring-2 ring-offset-0 z-10",
        !isSelected && `${color.border} ${color.bg}`,
        isSelected && `${color.selectedBorder} ${color.selectedBg} ${color.ring}`,
        hasSelection && !isSelected && "opacity-35",
      )}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
      }}
    >
      <span
        className={cn(
          "absolute -left-0.5 -top-3 z-20 inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold text-white shadow-sm",
          color.badge,
        )}
      >
        Q{questionNumber}
      </span>
    </button>
  );
}
