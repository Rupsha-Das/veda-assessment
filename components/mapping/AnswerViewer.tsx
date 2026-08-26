"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { TOTAL_PAGES } from "@/types/mapping";
import AnswerToolbar from "./AnswerToolbar";
import AnswerHighlight from "./AnswerHighlight";
import AnswerSheetPage from "./AnswerSheetPage";
import { mockQuestions } from "@/data/mockQuestions";
import type { ZoomLevel } from "@/types/mapping";

interface AnswerViewerProps {
  selectedId: number;
  onSelect: (id: number) => void;
  zoom: ZoomLevel;
  page: number;
  setPage: (p: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onBack: () => void;
  setHighlightRef: (id: number, el: HTMLButtonElement | null) => void;
}

const BASE_W = 580;
const BASE_H = Math.round(BASE_W * 1.414);

export default function AnswerViewer({
  selectedId,
  onSelect,
  zoom,
  page,
  setPage,
  onZoomIn,
  onZoomOut,
  onBack,
  setHighlightRef,
}: AnswerViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const z = zoom / 100;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const highlightsOnPage = useMemo(
    () =>
      mockQuestions.filter(
        (q) => q.answerRegion && q.answerRegion.page === page,
      ),
    [page],
  );

  const hasSelection = selectedId !== null;

  // Responsive scaling
  const isMobile = containerWidth > 0 && containerWidth < 640;
  const padding = isMobile ? 16 : 40;
  const availableWidth = containerWidth - padding;
  const fitScale = availableWidth > 0 ? availableWidth / BASE_W : 1;
  const effectiveScale = isMobile ? Math.min(fitScale, z) : z;
  const paperW = isMobile ? BASE_W * effectiveScale : BASE_W * z;
  const paperH = isMobile ? BASE_H * effectiveScale : BASE_H * z;

  return (
    <div ref={containerRef} className="flex h-full flex-col bg-[#efefef]">
      <AnswerToolbar
        zoom={zoom}
        page={page}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(TOTAL_PAGES, page + 1))}
        onBack={onBack}
      />

      <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        <div
          className="mx-auto"
          style={{ width: paperW, height: paperH }}
        >
          <div
            style={{
              width: BASE_W,
              height: BASE_H,
              transform: `scale(${effectiveScale})`,
              transformOrigin: "top left",
            }}
            className="relative"
          >
            <div className="relative h-full w-full overflow-hidden rounded shadow-lg ring-1 ring-black/5">
              <AnswerSheetPage pageNumber={page} />
              {highlightsOnPage.map((q) => (
                <AnswerHighlight
                  key={q.id}
                  question={q}
                  isSelected={q.id === selectedId}
                  hasSelection={hasSelection}
                  onSelect={() => onSelect(q.id)}
                  setRef={(el) => setHighlightRef(q.id, el)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
