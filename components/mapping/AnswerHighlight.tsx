"use client";

import { cn } from "@/lib/utils";
import type { AnswerRegion } from "@/types/exam";

type HighlightStatus = "correct" | "partial" | "incorrect";

function getAnswerHighlightStatus(
  marksObtained: number | undefined,
  maxMarks: number | undefined,
): HighlightStatus {
  if (marksObtained === undefined || maxMarks === undefined) return "incorrect";
  if (marksObtained === 0) return "incorrect";
  if (marksObtained >= maxMarks) return "correct";
  return "partial";
}

const STATUS_STYLES: Record<
  HighlightStatus,
  {
    border: string;
    bg: string;
    selectedBorder: string;
    selectedBg: string;
    ring: string;
    badge: string;
  }
> = {
  correct: {
    border: "border-green-500/60",
    bg: "bg-green-400/20",
    selectedBorder: "border-green-500",
    selectedBg: "bg-green-400/35",
    ring: "ring-green-500/30",
    badge: "bg-green-500",
  },
  partial: {
    border: "border-orange-500/60",
    bg: "bg-orange-400/20",
    selectedBorder: "border-orange-500",
    selectedBg: "bg-orange-400/35",
    ring: "ring-orange-500/30",
    badge: "bg-orange-500",
  },
  incorrect: {
    border: "border-red-500/60",
    bg: "bg-red-400/20",
    selectedBorder: "border-red-500",
    selectedBg: "bg-red-400/35",
    ring: "ring-red-500/30",
    badge: "bg-red-500",
  },
};

interface AnswerHighlightProps {
  questionNumber: string;
  region: AnswerRegion;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  setRef: (el: HTMLButtonElement | null) => void;
  marksObtained?: number;
  maxMarks?: number;
}

export default function AnswerHighlight({
  questionNumber,
  region,
  isSelected,
  hasSelection,
  onSelect,
  setRef,
  marksObtained,
  maxMarks,
}: AnswerHighlightProps) {
  const status = getAnswerHighlightStatus(marksObtained, maxMarks);
  const color = STATUS_STYLES[status];
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
