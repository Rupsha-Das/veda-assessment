"use client";

import { useState, useEffect, useRef } from "react";
import type { MobileTab, ZoomLevel } from "@/types/mapping";
import { ZOOM_LEVELS } from "@/types/mapping";
import { mockQuestions } from "@/data/mockQuestions";
import { cn } from "@/lib/utils";
import QuestionPanel from "./QuestionPanel";
import AnswerViewer from "./AnswerViewer";

interface MappingWorkspaceProps {
  onBack: () => void;
}

export default function MappingWorkspace({ onBack }: MappingWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([2]));
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [page, setPage] = useState(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>("questions");

  const highlightRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const selectedQuestion = mockQuestions.find((q) => q.id === selectedId);

  const setHighlightRef = (id: number, el: HTMLButtonElement | null) => {
    if (el) highlightRefs.current.set(id, el);
    else highlightRefs.current.delete(id);
  };

  useEffect(() => {
    if (!selectedQuestion?.answerRegion) return;
    const target = highlightRefs.current.get(selectedId);
    if (target) {
      setTimeout(
        () =>
          target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          }),
        100,
      );
    }
  }, [selectedId, selectedQuestion, page]);

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
  };

  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedIds.size === mockQuestions.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(mockQuestions.map((q) => q.id)));
    }
  };

  const selectQuestion = (id: number) => {
    setSelectedId(id);
    const q = mockQuestions.find((m) => m.id === id);
    if (q?.answerRegion && q.answerRegion.page !== page) {
      setPage(q.answerRegion.page);
    }
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
    setMobileTab("answersheet");
  };

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Mobile tab bar */}
      <div className="flex items-center justify-center gap-1 border-b border-[--color-border] bg-white px-4 py-3 lg:hidden">
        <div className="flex w-full max-w-xs gap-1 rounded-full bg-gray-100 p-1">
          {(["questions", "answersheet"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                mobileTab === tab
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab === "questions" ? "Questions" : "Answer Sheet"}
            </button>
          ))}
        </div>
      </div>

      {/* Question panel */}
      <div
        className={cn(
          "border-r border-[--color-border] bg-white transition-all lg:flex lg:flex-col",
          mobileTab === "questions" ? "flex flex-col" : "hidden",
          "lg:w-[380px] xl:w-[420px] lg:max-h-full lg:h-full h-[55%] lg:flex-shrink-0",
        )}
      >
        <QuestionPanel
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={selectQuestion}
          onToggleExpand={toggleExpand}
          onToggleAll={toggleAll}
        />
      </div>

      {/* Answer viewer */}
      <div
        className={cn(
          "min-h-0 flex-1 lg:flex",
          mobileTab === "answersheet" ? "flex flex-col" : "hidden",
        )}
      >
        <AnswerViewer
          selectedId={selectedId}
          onSelect={selectQuestion}
          zoom={zoom}
          page={page}
          setPage={setPage}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onBack={onBack}
          setHighlightRef={setHighlightRef}
        />
      </div>
    </div>
  );
}
