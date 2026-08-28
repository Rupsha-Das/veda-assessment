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
}

export default function MappingWorkspace({
  examData,
  answerSheetUrl,
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
  const selectedQuestionNumber =
    examData.questions.find((question) => question.id === selectedNumber)?.number ??
    null;

  const selectAnswerQuestion = (number: string) => {
    const question = examData.questions.find((item) => item.number === number);
    if (question) selectQuestion(question.id);
  };

  const setAnswerHighlightRef = (number: string, el: HTMLButtonElement | null) => {
    const question = examData.questions.find((item) => item.number === number);
    setHighlightRef(question?.id ?? number, el);
  };

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
    <div className="flex h-full min-w-0 flex-col overflow-hidden">
      <Tabs
        value={mobileTab}
        onValueChange={setMobileTab}
        className="mx-1.5 my-2 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm lg:hidden"
      >
        <TabsList className="mx-1.5 my-2 grid h-10 w-[calc(100%-0.75rem)] grid-cols-2 self-center rounded-full bg-[#ededed] p-1">
          <TabsTrigger
            value="questions"
            className="h-full w-full min-w-0 rounded-full px-3 py-0 text-xs text-foreground data-[active]:bg-[#292929] data-[active]:text-white"
          >
            Questions
          </TabsTrigger>
          <TabsTrigger
            value="answer"
            className="h-full w-full min-w-0 rounded-full px-3 py-0 text-xs text-foreground data-[active]:bg-[#292929] data-[active]:text-white"
          >
            Answer Sheet
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="questions"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <QuestionPanel
            questions={examData.questions}
            answers={examData.answers}
            selectedNumber={selectedNumber}
            expandedIds={expandedIds}
            onSelect={handleMobileTabSelect}
            onToggleExpand={toggleExpand}
            onToggleAll={toggleAll}
          />
        </TabsContent>

        <TabsContent
          value="answer"
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <AnswerViewer
            answers={examData.answers}
            answerSheetUrl={answerSheetUrl}
            selectedNumber={selectedQuestionNumber}
            onSelect={selectAnswerQuestion}
            zoom={zoom}
            page={page}
            setPage={setPage}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            setHighlightRef={setAnswerHighlightRef}
            totalPages={totalPages}
          />
        </TabsContent>
      </Tabs>

      <div className="hidden min-h-0 min-w-0 flex-1 lg:flex">
        <ResizablePanelGroup
          orientation="horizontal"
          className="min-h-0 flex-1"
        >
          <ResizablePanel
            defaultSize="45%"
            minSize="25%"
            maxSize="55%"
            className="flex min-h-0 min-w-0 flex-col bg-white"
          >
            <QuestionPanel
              questions={examData.questions}
              answers={examData.answers}
              selectedNumber={selectedNumber}
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
            className="flex min-h-0 min-w-0 flex-col"
          >
            <AnswerViewer
              answers={examData.answers}
              answerSheetUrl={answerSheetUrl}
              selectedNumber={selectedQuestionNumber}
              onSelect={selectAnswerQuestion}
              zoom={zoom}
              page={page}
              setPage={setPage}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              setHighlightRef={setAnswerHighlightRef}
              totalPages={totalPages}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
