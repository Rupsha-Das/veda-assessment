"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
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

const BASE_W = 620;
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
  const z = zoom / 100;

  const highlightsOnPage = useMemo(
    () =>
      mockQuestions.filter(
        (q) => q.answerRegion && q.answerRegion.page === page,
      ),
    [page],
  );

  const hasSelection = selectedId !== null;

  return (
    <div className="flex h-full flex-col bg-[#efefef]">
      <AnswerToolbar
        zoom={zoom}
        page={page}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onPrevPage={() => setPage(Math.max(1, page - 1))}
        onNextPage={() => setPage(Math.min(TOTAL_PAGES, page + 1))}
        onBack={onBack}
      />

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div
          className="mx-auto"
          style={{
            width: BASE_W * z,
            height: BASE_H * z,
          }}
        >
          <div
            style={{
              width: BASE_W,
              height: BASE_H,
              transform: `scale(${z})`,
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
