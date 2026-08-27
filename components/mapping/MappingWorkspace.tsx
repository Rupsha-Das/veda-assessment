"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import type { ZoomLevel } from "@/types/mapping";
import { ZOOM_LEVELS } from "@/types/mapping";
import type { ProcessExamResponse } from "@/types/exam";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import QuestionPanel from "./QuestionPanel";
import AnswerViewer from "./AnswerViewer";

interface MappingWorkspaceProps {
  examData: ProcessExamResponse;
  answerSheetUrl: string;
  onBack: () => void;
}

export default function MappingWorkspace({
  examData,
  answerSheetUrl,
  onBack,
}: MappingWorkspaceProps) {
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<ZoomLevel>(100);
  const [page, setPage] = useState(0);
  const [mobileTab, setMobileTab] = useState<string>("questions");

  const highlightRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const setHighlightRef = useCallback(
    (id: string, el: HTMLButtonElement | null) => {
      if (el) highlightRefs.current.set(id, el);
      else highlightRefs.current.delete(id);
    },
    [],
  );

  const totalPages = useMemo(
    () => examData.answerPages.length || 1,
    [examData.answerPages],
  );

  const handleZoomIn = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx < ZOOM_LEVELS.length - 1) setZoom(ZOOM_LEVELS[idx + 1]);
  };

  const handleZoomOut = () => {
    const idx = ZOOM_LEVELS.indexOf(zoom);
    if (idx > 0) setZoom(ZOOM_LEVELS[idx - 1]);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (expandedIds.size === examData.questions.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(examData.questions.map((q) => q.id)));
    }
  };

  const findFirstRegion = (questionNumber: string) => {
    const answer = examData.answers.find(
      (a) => a.questionNumber === questionNumber,
    );
    if (!answer || answer.regions.length === 0) return null;
    return answer.regions[0];
  };

  const selectQuestion = (id: string) => {
    setSelectedNumber(id);
    const q = examData.questions.find((m) => m.id === id);
    if (q) {
      const region = findFirstRegion(q.number);
      if (region && region.pageIndex !== page) {
        setPage(region.pageIndex);
      }
    }
    setExpandedIds((prev) => {
      if (prev.has(id)) return prev;
      return new Set(prev).add(id);
    });
    setTimeout(() => {
      const target = highlightRefs.current.get(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 150);
  };

  const handleMobileTabSelect = (id: string) => {
    selectQuestion(id);
    setMobileTab("answer");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <Tabs
        value={mobileTab}
        onValueChange={setMobileTab}
        className="flex min-h-0 flex-1 flex-col lg:hidden"
      >
        <TabsList className="mx-4 my-2 h-auto w-fit justify-start rounded-full bg-gray-200 p-1">
          <TabsTrigger
            value="questions"
            className="rounded-full px-5 py-2 data-[active]:bg-[#292929] data-[active]:text-white"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger
            value="answer"
            className="rounded-full px-5 py-2 data-[active]:bg-[#292929] data-[active]:text-white"
          >
            Answer Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="questions"
          className="min-h-0 flex-1 overflow-hidden"
        >
          <QuestionPanel
            questions={examData.questions}
            answers={examData.answers}
            selectedNumber={selectedNumber}
            expandedIds={expandedIds}
            onSelect={handleMobileTabSelect}
            onToggleExpand={toggleExpand}
            onToggleAll={toggleAll}
            onBack={onBack}
          />
        </TabsContent>

        <TabsContent value="answer" className="min-h-0 flex-1 overflow-hidden">
          <AnswerViewer
            answers={examData.answers}
            answerSheetUrl={answerSheetUrl}
            selectedNumber={selectedNumber}
            onSelect={selectQuestion}
            zoom={zoom}
            page={page}
            setPage={setPage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onBack={onBack}
            setHighlightRef={setHighlightRef}
            totalPages={totalPages}
          />
        </TabsContent>
      </Tabs>

      <div className="hidden min-h-0 flex-1 lg:flex">
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
              questions={examData.questions}
              answers={examData.answers}
              selectedNumber={selectedNumber}
              expandedIds={expandedIds}
              onSelect={selectQuestion}
              onToggleExpand={toggleExpand}
              onToggleAll={toggleAll}
              onBack={onBack}
            />
          </ResizablePanel>

          <ResizableHandle className="w-px bg-border" />

          <ResizablePanel
            defaultSize="55%"
            minSize="45%"
            className="min-h-0 min-w-0 flex-col"
          >
            <AnswerViewer
              answers={examData.answers}
              answerSheetUrl={answerSheetUrl}
              selectedNumber={selectedNumber}
              onSelect={selectQuestion}
              zoom={zoom}
              page={page}
              setPage={setPage}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onBack={onBack}
              setHighlightRef={setHighlightRef}
              totalPages={totalPages}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
