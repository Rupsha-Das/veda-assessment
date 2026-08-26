"use client";

import { cn } from "@/lib/utils";
import type { MockQuestion } from "@/types/mapping";

interface AnswerHighlightProps {
  question: MockQuestion;
  isSelected: boolean;
  hasSelection: boolean;
  onSelect: () => void;
  setRef: (el: HTMLButtonElement | null) => void;
}

export default function AnswerHighlight({
  question,
  isSelected,
  hasSelection,
  onSelect,
  setRef,
}: AnswerHighlightProps) {
  const region = question.answerRegion;
  if (!region) return null;

  const status = question.status;

  return (
    <button
      ref={setRef}
      id={`highlight-${question.id}`}
      aria-label={`Answer for Q${question.id}`}
      onClick={onSelect}
      className={cn(
        "absolute rounded-md border-2 transition-all duration-200",
        isSelected && "ring-2 ring-offset-0 z-10",
        status === "mapped" &&
          !isSelected &&
          "border-emerald-500/60 bg-emerald-400/20",
        status === "review" &&
          !isSelected &&
          "border-orange-500/60 bg-orange-400/20",
        isSelected &&
          status === "mapped" &&
          "border-emerald-500 bg-emerald-400/35 ring-emerald-500/30",
        isSelected &&
          status === "review" &&
          "border-orange-500 bg-orange-400/35 ring-orange-500/30",
        hasSelection && !isSelected && "opacity-35",
      )}
      style={{
        left: `${region.x}%`,
        top: `${region.y}%`,
        width: `${region.width}%`,
        height: `${region.height}%`,
      }}
    >
      <span
        className={cn(
          "absolute -left-0.5 -top-3 z-20 inline-flex items-center rounded-full px-1.5 py-px text-[9px] font-bold text-white shadow-sm",
          status === "mapped" && "bg-emerald-500",
          status === "review" && "bg-orange-500",
        )}
      >
        Q{question.id}
      </span>
    </button>
  );
}
