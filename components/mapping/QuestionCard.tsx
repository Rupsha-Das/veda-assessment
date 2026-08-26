"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MockQuestion } from "@/types/mapping";

interface QuestionCardProps {
  question: MockQuestion;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
}

export default function QuestionCard({
  question,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: QuestionCardProps) {
  const hasScore =
    question.score && question.score !== "0/2" && question.score !== "0/5";

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
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            isSelected
              ? "bg-[--color-veda-orange] text-white"
              : "bg-[--color-veda-dark] text-white",
          )}
        >
          {question.id}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-foreground">
            {question.question}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          {question.score && (
            <span
              className={cn(
                "text-xs font-semibold",
                hasScore ? "text-[--color-veda-green]" : "text-red-400",
              )}
            >
              {question.score}
            </span>
          )}
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
          {question.status === "review" && question.feedback && (
            <div className="rounded-xl border border-orange-200 bg-[--color-veda-orange-soft] p-3">
              <p className="mb-1 text-xs font-bold text-[--color-veda-orange]">
                AI Feedback
              </p>
              <p className="text-[13px] leading-relaxed text-foreground">
                {question.feedback}
              </p>
            </div>
          )}
          {question.status === "mapped" && question.answerExcerpt && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="mb-1 text-xs font-semibold text-foreground">
                Mapped to Answer Sheet
                {question.answerRegion && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    &middot; Page {question.answerRegion.page}
                  </span>
                )}
              </p>
              <p className="text-[13px] leading-relaxed text-muted-foreground italic">
                &quot;{question.answerExcerpt}&quot;
              </p>
            </div>
          )}
          {question.status === "unmapped" && (
            <div className="rounded-xl bg-gray-50 p-3">
              <p className="text-[13px] text-muted-foreground">
                No matching region found in the answer sheet.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
