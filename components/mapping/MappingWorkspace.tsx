"use client";

import { useState, useRef, useCallback } from "react";
import type { ZoomLevel } from "@/types/mapping";
import { ZOOM_LEVELS, TOTAL_PAGES } from "@/types/mapping";
import { mockQuestions } from "@/data/mockQuestions";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import QuestionPanel from "./QuestionPanel";
import AnswerViewer from "./AnswerViewer";

interface MappingWorkspaceProps {
  onBack: () => void;
}

export default function MappingWorkspace({ onBack }: MappingWorkspaceProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [page, setPage] = useState(1);

  const highlightRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const setHighlightRef = useCallback(
    (id: number, el: HTMLButtonElement | null) => {
      if (el) highlightRefs.current.set(id, el);
      else highlightRefs.current.delete(id);
    },
    [],
  );

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
    // Scroll highlight into view
    setTimeout(() => {
      const target = highlightRefs.current.get(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-0 flex-1"
      >
        <ResizablePanel
          defaultSize="45%"
          minSize="25%"
          maxSize="55%"
          className="min-h-0 min-w-0 flex-col bg-white"
        >
          <QuestionPanel
            selectedId={selectedId}
            expandedIds={expandedIds}
            onSelect={selectQuestion}
            onToggleExpand={toggleExpand}
            onToggleAll={toggleAll}
          />
        </ResizablePanel>

        <ResizableHandle className="w-px bg-border" />

        <ResizablePanel
          defaultSize="55%"
          minSize="45%"
          className="min-h-0 min-w-0 flex-col"
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
            totalPages={TOTAL_PAGES}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
