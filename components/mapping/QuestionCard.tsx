"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Question } from "@/types/exam";

interface QuestionCardProps {
  question: Question;
  hasAnswer: boolean;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function QuestionCard({
  question,
  hasAnswer,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: QuestionCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-2xl border bg-white transition-all duration-150",
        isSelected
          ? "border-[--color-veda-orange] shadow-sm"
          : "border-[--color-border] hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
            isSelected
              ? "bg-[--color-veda-orange] text-white"
              : "bg-[--color-veda-dark] text-white",
          )}
        >
          Q{question.number}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-foreground">
            {question.text}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            aria-expanded={isExpanded}
            className="inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gray-100"
          >
            <ChevronDown
              className={cn(
                "size-4 transition-transform duration-200",
                isExpanded && "rotate-180",
              )}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="animate-fade-in border-t border-[--color-border] px-3 pb-3 pt-3">
          {hasAnswer ? (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[13px] text-muted-foreground">
                Answer region detected on the answer sheet.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[13px] text-muted-foreground">
                No matching answer region found on the answer sheet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
