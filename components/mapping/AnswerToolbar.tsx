"use client";

import { ZoomIn, ZoomOut, ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";
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
  onBack: () => void;
}

export default function AnswerToolbar({
  zoom,
  page,
  totalPages,
  onZoomIn,
  onZoomOut,
  onPrevPage,
  onNextPage,
  onBack,
}: AnswerToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-3 py-2">
      <Button
        variant="ghost"
        size="icon-xs"
        onClick={onBack}
        className="text-gray-700 hover:bg-gray-200"
        aria-label="Back to submission"
      >
        <ArrowLeft />
      </Button>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
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
        <span className="min-w-[40px] text-center text-sm font-medium tabular-nums text-gray-900">
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
      <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onPrevPage}
          disabled={page <= 1}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Button>
        <span className="whitespace-nowrap text-sm text-gray-900">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onNextPage}
          disabled={page >= totalPages}
          className="text-gray-700 hover:bg-gray-200"
          aria-label="Next page"
        >
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
