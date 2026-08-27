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
  const z = zoom / 100;

  const highlightsOnPage = useMemo(() => {
    const result: { questionNumber: string; region: AnswerRegion }[] = [];
    for (const answer of answers) {
      const region = answer.regions.find((r) => r.pageIndex === page);
      if (region) {
        result.push({
          questionNumber: answer.questionNumber,
          region,
        });
      }
    }
    return result;
  }, [answers, page]);

  const hasSelection = selectedNumber !== null;

  const isImage = answerSheetUrl.includes("image/");

  return (
    <div ref={containerRef} className="flex h-full flex-col bg-[#efefef]">
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

      <div className="min-h-0 flex-1 overflow-auto p-2 sm:p-4 md:p-6">
        <div className="mx-auto flex justify-center">
          <div className="relative inline-block">
            {isImage ? (
              <ImagePage
                url={answerSheetUrl}
                zoom={z}
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
  highlights,
  selectedNumber,
  hasSelection,
  onSelect,
  setHighlightRef,
}: {
  url: string;
  pageNumber: number;
  zoom: number;
  highlights: { questionNumber: string; region: AnswerRegion }[];
  selectedNumber: string | null;
  hasSelection: boolean;
  onSelect: (id: string) => void;
  setHighlightRef: (id: string, el: HTMLButtonElement | null) => void;
}) {
  const [Document, setDocument] = useState<typeof import("react-pdf").Document | null>(null);
  const [Page, setPageComp] = useState<typeof import("react-pdf").Page | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  useEffect(() => {
    import("react-pdf").then((mod) => {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
      setDocument(() => mod.Document);
      setPageComp(() => mod.Page);
    });
  }, []);

  if (!Document || !Page) {
    return (
      <div className="flex h-[600px] w-[420px] items-center justify-center rounded bg-gray-100">
        <p className="text-sm text-muted-foreground">Loading PDF viewer...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Document
        file={url}
        onLoadSuccess={() => setPdfLoaded(true)}
        loading={
          <div className="flex h-[600px] w-[420px] items-center justify-center rounded bg-gray-100">
            <p className="text-sm text-muted-foreground">Loading PDF...</p>
          </div>
        }
        error={
          <div className="flex h-[600px] w-[420px] items-center justify-center rounded bg-red-50">
            <p className="text-sm text-red-500">Failed to load PDF.</p>
          </div>
        }
      >
        <Page
          pageNumber={pageNumber + 1}
          scale={zoom}
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
  highlights,
  selectedNumber,
  hasSelection,
  onSelect,
  setHighlightRef,
}: {
  url: string;
  zoom: number;
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

  const displayW = dims.w * zoom;
  const displayH = dims.h * zoom;

  return (
    <div className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Answer sheet"
        onLoad={handleLoad}
        style={{
          width: displayW || undefined,
          height: displayH || undefined,
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
