"use client";

import { mockQuestions } from "@/data/mockQuestions";
import QuestionCard from "./QuestionCard";

interface QuestionPanelProps {
  selectedId: number;
  expandedIds: Set<number>;
  onSelect: (id: number) => void;
  onToggleExpand: (id: number) => void;
  onToggleAll: () => void;
}

export default function QuestionPanel({
  selectedId,
  expandedIds,
  onSelect,
  onToggleExpand,
  onToggleAll,
}: QuestionPanelProps) {
  const allExpanded = expandedIds.size === mockQuestions.length;

  return (
    <>
      <div className="flex items-center justify-between border-b border-[--color-border] px-4 py-3">
        <h2 className="text-[13px] font-semibold leading-snug text-foreground">
          Extracted Questions
          <br />
          <span className="font-normal text-muted-foreground">
            (from question paper)
          </span>
        </h2>
        <button
          onClick={onToggleAll}
          className="shrink-0 rounded-lg border border-[--color-border] px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {allExpanded ? "Collapse All" : "Expand All"}
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex flex-col gap-2">
          {mockQuestions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isSelected={q.id === selectedId}
              isExpanded={expandedIds.has(q.id)}
              onSelect={() => onSelect(q.id)}
              onToggleExpand={() => onToggleExpand(q.id)}
            />
          ))}
        </div>
      </div>
    </>
  );
}
