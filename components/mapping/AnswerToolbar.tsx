"use client";

import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ZoomLevel } from "@/types/mapping";

interface AnswerToolbarProps {
  zoom: ZoomLevel;
  page: number;
  totalPages: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export default function AnswerToolbar({
  zoom,
  page,
  totalPages,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
}: AnswerToolbarProps) {
  return (
    <div className="flex shrink-0 flex-wrap items-center justify-center gap-2 border-b border-gray-200 bg-white px-2 py-2">
      {/* Zoom controls */}
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onZoomOut}
          disabled={zoom <= 50}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Zoom out"
        >
          <ZoomOut />
        </Button>
        <span className="min-w-9 text-center text-sm font-medium tabular-nums text-gray-900">
          {zoom}%
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onZoomIn}
          disabled={zoom >= 150}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Zoom in"
        >
          <ZoomIn />
        </Button>
      </div>

      {/* Page navigation */}
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onPrevPage}
          disabled={page <= 0}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        <span className="whitespace-nowrap text-sm text-gray-900">
          Page {page + 1} of {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNextPage}
          disabled={page >= totalPages - 1}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
