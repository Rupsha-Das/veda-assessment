"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import type { ZoomLevel } from "@/types/mapping";
import type { AnswerGroup, AnswerRegion } from "@/types/exam";
import AnswerToolbar from "./AnswerToolbar";
import AnswerHighlight from "./AnswerHighlight";

interface AnswerViewerProps {
  answers: AnswerGroup[];
  answerSheetUrl: string;
  selectedNumber: string | null;
  onSelect: (id: string) => void;
  zoom: ZoomLevel;
  page: number;
  setPage: (p: number) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onBack: () => void;
  setHighlightRef: (id: string, el: HTMLButtonElement | null) => void;
  totalPages: number;
}

export default function AnswerViewer({
  answers,
  answerSheetUrl,
  selectedNumber,
  onSelect,
  zoom,
  page,
  setPage,
  onZoomIn,
  onZoomOut,
  onBack,
  setHighlightRef,
  totalPages,
}: AnswerViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const z = zoom / 100;
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = contentRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;

    const updateSize = () => {
      const styles = getComputedStyle(element);
      const horizontalPadding =
        parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight);
      const verticalPadding =
        parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);

      setContentSize({
        width: Math.max(0, element.clientWidth - horizontalPadding),
        height: Math.max(0, element.clientHeight - verticalPadding),
      });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const highlightsOnPage = useMemo(() => {
    if (selectedNumber === null) return [];

    const answer = answers.find(
      (item) => item.questionNumber === selectedNumber,
    );
    const region = answer?.regions.find((item) => item.pageIndex === page);

    return region
      ? [{ questionNumber: selectedNumber, region }]
      : [];
  }, [answers, page, selectedNumber]);

  const hasSelection = selectedNumber !== null;

  const isImage = answerSheetUrl.includes("image/");

  return (
    <div
      ref={containerRef}
      className="flex h-full min-w-0 max-w-full flex-col overflow-hidden bg-[#efefef]"
    >
      <AnswerToolbar
        zoom={zoom}
        page={page}
        totalPages={totalPages}
        onZoomIn={onZoomIn}
        onZoomOut={onZoomOut}
        onPrevPage={() => setPage(Math.max(0, page - 1))}
        onNextPage={() => setPage(Math.min(totalPages - 1, page + 1))}
        onBack={onBack}
      />

      <div
        ref={contentRef}
        className="min-h-0 min-w-0 max-w-full flex-1 overflow-auto p-2 sm:p-4 md:p-6"
      >
        <div className="flex min-h-full min-w-full w-max justify-center">
          <div className="relative shrink-0">
            {isImage ? (
              <ImagePage
                url={answerSheetUrl}
                zoom={z}
                availableWidth={contentSize.width}
                availableHeight={contentSize.height}
                highlights={highlightsOnPage}
                selectedNumber={selectedNumber}
                hasSelection={hasSelection}
                onSelect={onSelect}
                setHighlightRef={setHighlightRef}
              />
            ) : (
              <PdfPage
                url={answerSheetUrl}
                pageNumber={page}
                zoom={z}
                availableWidth={contentSize.width}
                availableHeight={contentSize.height}
                highlights={highlightsOnPage}
                selectedNumber={selectedNumber}
                hasSelection={hasSelection}
                onSelect={onSelect}
                setHighlightRef={setHighlightRef}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- PDF rendering ---------- */

function PdfPage({
  url,
  pageNumber,
  zoom,
  availableWidth,
  availableHeight,
  highlights,
  selectedNumber,
  hasSelection,
  onSelect,
  setHighlightRef,
}: {
  url: string;
  pageNumber: number;
  zoom: number;
  availableWidth: number;
  availableHeight: number;
  highlights: { questionNumber: string; region: AnswerRegion }[];
  selectedNumber: string | null;
  hasSelection: boolean;
  onSelect: (id: string) => void;
  setHighlightRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const [Document, setDocument] = useState<typeof import("react-pdf").Document | null>(null);
  const [Page, setPageComp] = useState<typeof import("react-pdf").Page | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setDocument(() => mod.Document);
      setPageComp(() => mod.Page);
    });
  }, []);

  if (!Document || !Page) {
    return (
      <div className="flex aspect-[7/10] min-h-[420px] w-full max-w-[420px] items-center justify-center rounded bg-gray-100">
        <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
      </div>
    );
  }

  const fitWidth =
    pageSize.width > 0 && pageSize.height > 0
      ? Math.min(
          availableWidth,
          availableHeight * (pageSize.width / pageSize.height),
        )
      : availableWidth;
  const pageWidth = Math.max(0, fitWidth - 16) * zoom;

  return (
    <div className="relative shrink-0" style={{ width: pageWidth || undefined }}>
      <Document
        file={url}
        onLoadSuccess={() => setPdfLoaded(true)}
        loading={
          <div className="flex aspect-[7/10] min-h-[420px] w-full max-w-[420px] items-center justify-center rounded bg-gray-100">
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex aspect-[7/10] min-h-[420px] w-full max-w-[420px] items-center justify-center rounded bg-red-50">
            <p className="text-sm text-red-500">Failed to load PDF.</p>
          </div>
        }
      >
        <Page
          pageNumber={pageNumber + 1}
          {...(pageWidth > 0 ? { width: pageWidth } : { scale: zoom })}
          onLoadSuccess={(loadedPage) => {
            const viewport = loadedPage.getViewport({ scale: 1 });
            setPageSize({ width: viewport.width, height: viewport.height });
          }}
          renderAnnotationLayer={false}
          renderTextLayer={false}
          className="shadow-lg"
        />
      </Document>
      {pdfLoaded && (
        <div className="absolute inset-0">
          {highlights.map((h) => (
            <AnswerHighlight
              key={h.questionNumber}
              questionNumber={h.questionNumber}
              region={h.region}
              isSelected={h.questionNumber === selectedNumber}
              hasSelection={hasSelection}
              onSelect={() => onSelect(h.questionNumber)}
              setRef={(el) => setHighlightRef(h.questionNumber, el)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Image rendering ---------- */

function ImagePage({
  url,
  zoom,
  availableWidth,
  availableHeight,
  highlights,
  selectedNumber,
  hasSelection,
  onSelect,
  setHighlightRef,
}: {
  url: string;
  zoom: number;
  availableWidth: number;
  availableHeight: number;
  highlights: { questionNumber: string; region: AnswerRegion }[];
  selectedNumber: string | null;
  hasSelection: boolean;
  onSelect: (id: string) => void;
  setHighlightRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const [dims, setDims] = useState({ w: 0, h: 0 });

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      setDims({ w: img.naturalWidth, h: img.naturalHeight });
      setLoaded(true);
    },
    [],
  );

  const fitWidth =
    dims.w > 0 && dims.h > 0
      ? Math.min(availableWidth, availableHeight * (dims.w / dims.h))
      : availableWidth;
  const displayW = Math.max(0, fitWidth - 16) * zoom;

  return (
    <div className="relative shrink-0" style={{ width: displayW || undefined }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Answer sheet"
        onLoad={handleLoad}
        style={{
          width: displayW || undefined,
          height: "auto",
          display: "block",
        }}
        className="shadow-lg"
      />
      {loaded && (
        <div className="absolute inset-0">
          {highlights.map((h) => (
            <AnswerHighlight
              key={h.questionNumber}
              questionNumber={h.questionNumber}
              region={h.region}
              isSelected={h.questionNumber === selectedNumber}
              hasSelection={hasSelection}
              onSelect={() => onSelect(h.questionNumber)}
              setRef={(el) => setHighlightRef(h.questionNumber, el)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
