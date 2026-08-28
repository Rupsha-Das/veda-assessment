"use client";

import type { Question, AnswerGroup } from "@/types/exam";
import QuestionCard from "./QuestionCard";

interface QuestionPanelProps {
  questions: Question[];
  answers: AnswerGroup[];
  selectedNumber: string | null;
  expandedIds: Set<string>;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleAll: () => void;
}

export default function QuestionPanel({
  questions,
  answers,
  selectedNumber,
  expandedIds,
  onSelect,
  onToggleExpand,
  onToggleAll,
}: QuestionPanelProps) {
  const allExpanded = expandedIds.size === questions.length;

  const hasAnswer = (number: string) =>
    answers.some((a) => a.questionNumber === number);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between border-b border-[--color-border] px-4 py-3">
        <h2 className="text-[13px] font-semibold text-foreground">
          Extracted Questions{" "}
          <span className="font-normal text-muted-foreground">
            (from question paper)
          </span>
        </h2>
        <button
          onClick={onToggleAll}
          className="rounded-lg border border-[--color-border] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-3 [touch-action:pan-y]">
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              hasAnswer={hasAnswer(q.number)}
              isSelected={q.id === selectedNumber}
              isExpanded={expandedIds.has(q.id)}
              onSelect={() => onSelect(q.id)}
              onToggleExpand={() => onToggleExpand(q.id)}
            />
          ))}
          {questions.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No questions could be extracted from the question paper.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
