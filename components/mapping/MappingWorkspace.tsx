"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MobileTab, ZoomLevel } from "@/types/mapping";
import { ZOOM_LEVELS } from "@/types/mapping";
import { mockQuestions } from "@/data/mockQuestions";
import { cn } from "@/lib/utils";
import QuestionPanel from "./QuestionPanel";
import AnswerViewer from "./AnswerViewer";

interface MappingWorkspaceProps {
  onBack: () => void;
}

const MIN_PANEL_W = 320;
const MAX_PANEL_W = 600;
const DEFAULT_PANEL_W = 420;

export default function MappingWorkspace({ onBack }: MappingWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set([2]));
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [page, setPage] = useState(1);
  const [mobileTab, setMobileTab] = useState<MobileTab>("questions");
  const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_W);

  const highlightRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleDragMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - rect.left;
      setPanelWidth(Math.max(MIN_PANEL_W, Math.min(MAX_PANEL_W, newWidth)));
    };
    const handleDragEnd = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("mouseup", handleDragEnd);
    return () => {
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
    };
  }, []);

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
  };

  return (
    <div ref={containerRef} className="flex h-full flex-col overflow-hidden lg:flex-row">
      {/* Mobile tab bar */}
      <div className="flex shrink-0 items-center justify-center border-b border-[--color-border] bg-white px-4 py-2.5 lg:hidden">
        <div className="flex w-full max-w-[280px] gap-1 rounded-full bg-gray-100 p-1">
          {(["questions", "answersheet"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-all",
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

      {/* Question panel - left side */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col bg-white lg:flex-shrink-0 lg:border-r lg:border-[--color-border]",
          mobileTab === "questions" ? "flex" : "hidden lg:flex",
        )}
        style={{ width: typeof window !== "undefined" && window.innerWidth >= 1024 ? panelWidth : undefined }}
      >
        <QuestionPanel
          selectedId={selectedId}
          expandedIds={expandedIds}
          onSelect={selectQuestion}
          onToggleExpand={toggleExpand}
          onToggleAll={toggleAll}
        />
      </div>

      {/* Draggable divider - desktop only */}
      <div
        onMouseDown={handleDragStart}
        className="hidden w-1 cursor-col-resize bg-[--color-border] transition-colors hover:bg-[--color-veda-orange] lg:block"
      />

      {/* Answer viewer - right side */}
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col",
          mobileTab === "answersheet" ? "flex" : "hidden lg:flex",
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
