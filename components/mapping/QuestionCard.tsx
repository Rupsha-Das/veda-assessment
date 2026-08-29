"use client";

import { ChevronDown, Sparkles } from "lucide-react";
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

function displayFeedback(questionNumber: string, feedback: string, complete: boolean) {
  if (
    /^(Excellent work!|Strong response!|Great job!|Well done!|Good attempt\.|You’re on the right track\.|Solid start\.|There are some good points here\.)/.test(
      feedback,
    ) || feedback.startsWith("No answer")
  ) {
    return feedback;
  }

  const openings = complete
    ? ["Excellent work!", "Strong response!", "Great job!", "Well done!"]
    : [
        "Good attempt.",
        "You’re on the right track.",
        "Solid start.",
        "There are some good points here.",
      ];
  const numericPart = Number.parseInt(questionNumber, 10);
  const index = Number.isNaN(numericPart)
    ? questionNumber.length % openings.length
    : Math.abs(numericPart) % openings.length;

  return `${openings[index]} ${feedback}`;
}

export default function QuestionCard({
  question,
  hasAnswer,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
}: QuestionCardProps) {
  const hasScore =
    question.marksObtained !== undefined && question.maxMarks !== undefined;
  const scoreIsZero = hasScore && question.marksObtained === 0;
  const scoreIsFull =
    hasScore && question.marksObtained === question.maxMarks;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-2xl border bg-white transition-all duration-150",
        isSelected
          ? "border-[#ff633d] shadow-[inset_0_0_0_1px_#ff633d]"
          : "border-[--color-border] hover:border-gray-300 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-3 p-3">
        <div
          className={cn(
            "flex min-w-7 shrink-0 items-center justify-center rounded-full bg-foreground px-1.5 text-[11px] font-bold text-background transition-colors",
            isSelected && "bg-[#ff633d] text-white ring-2 ring-[#ff633d]/20 ring-offset-1",
          )}
        >
          {question.displayNumber ?? question.number}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-foreground">
            {question.text}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold",
              !hasScore && "bg-gray-100 text-muted-foreground",
              scoreIsZero && "bg-red-50 text-red-500",
              scoreIsFull && "bg-green-50 text-[--color-veda-green]",
              hasScore && !scoreIsZero && !scoreIsFull && "bg-orange-50 text-orange-600",
            )}
          >
            {hasScore
              ? `${question.marksObtained} / ${question.maxMarks}`
              : "— / —"}
          </span>
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
          {question.feedback ? (
            <div className="relative overflow-hidden rounded-xl border border-zinc-200/90 border-l-2 border-l-[--color-veda-orange] bg-gradient-to-br from-zinc-50 via-white to-zinc-100/80 p-4 shadow-[0_5px_18px_-12px_rgba(41,41,41,0.7)]">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-[--color-veda-orange]" />
                <p className="text-sm font-semibold text-foreground">
                  AI Feedback
                </p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                {displayFeedback(question.number, question.feedback, scoreIsFull)}
              </p>
            </div>
          ) : hasAnswer ? (
            <div className="relative overflow-hidden rounded-xl border border-zinc-200/90 border-l-2 border-l-zinc-400 bg-gradient-to-br from-zinc-50 via-white to-zinc-100/80 p-4 shadow-[0_5px_18px_-12px_rgba(41,41,41,0.7)]">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-muted-foreground" />
                <p className="text-sm font-semibold text-foreground">
                  AI Feedback
                </p>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Evaluation is unavailable for this answer. Try processing the
                papers again.
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
