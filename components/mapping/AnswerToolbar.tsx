"use client";

import {
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

function TBtn({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-gray-100 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {children}
    </button>
  );
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
    <div className="flex h-11 shrink-0 items-center gap-1 border-b border-[--color-border] bg-white px-2 sm:px-3">
      <TBtn label="Back" onClick={onBack}>
        <ArrowLeft className="size-4" />
      </TBtn>
      <span className="text-sm font-semibold text-foreground">
        Answer Sheet
      </span>

      <div className="ml-auto flex items-center gap-0.5">
        <TBtn label="Zoom out" onClick={onZoomOut} disabled={zoom <= 50}>
          <ZoomOut className="size-4" />
        </TBtn>
        <span className="w-10 text-center text-xs font-medium tabular-nums text-foreground">
          {zoom}%
        </span>
        <TBtn label="Zoom in" onClick={onZoomIn} disabled={zoom >= 150}>
          <ZoomIn className="size-4" />
        </TBtn>

        <div className="mx-0.5 h-4 w-px bg-[--color-border]" />

        <TBtn label="Previous page" onClick={onPrevPage} disabled={page <= 1}>
          <ChevronLeft className="size-4" />
        </TBtn>
        <span className="whitespace-nowrap text-[11px] text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <TBtn
          label="Next page"
          onClick={onNextPage}
          disabled={page >= totalPages}
        >
          <ChevronRight className="size-4" />
        </TBtn>

        <div className="mx-0.5 h-4 w-px bg-[--color-border]" />

        <TBtn label="More options">
          <MoreVertical className="size-4" />
        </TBtn>
      </div>
    </div>
  );
}
