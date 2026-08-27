"use client";

import { useState, useEffect, useCallback } from "react";
import type { UploadedFileMeta } from "@/types/mapping";
import type { ProcessExamResponse } from "@/types/exam";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadPage from "@/components/upload/UploadPage";
import ExtractionLoader from "@/components/loading/ExtractionLoader";
import MappingWorkspace from "@/components/mapping/MappingWorkspace";

export default function ExamsApp() {
  const [screen, setScreen] = useState<"upload" | "loading" | "mapping">("upload");
  const [questionPaper, setQuestionPaper] = useState<UploadedFileMeta | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFileMeta | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [answerFile, setAnswerFile] = useState<File | null>(null);
  const [examData, setExamData] = useState<ProcessExamResponse | null>(null);
  const [answerSheetUrl, setAnswerSheetUrl] = useState<string | null>(null);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarCollapsed(screen === "mapping");
  }, [screen]);

  useEffect(() => {
    return () => {
      if (answerSheetUrl) URL.revokeObjectURL(answerSheetUrl);
    };
  }, [answerSheetUrl]);

  const handleUpload = useCallback(
    (kind: "question" | "answer", file: UploadedFileMeta, raw: File) => {
      if (kind === "question") {
        setQuestionPaper(file);
        setQuestionFile(raw);
      } else {
        setAnswerSheet(file);
        setAnswerFile(raw);
      }
    },
    [],
  );

  const handleRemove = useCallback(
    (kind: "question" | "answer") => {
      if (kind === "question") {
        setQuestionPaper(null);
        setQuestionFile(null);
      } else {
        setAnswerSheet(null);
        setAnswerFile(null);
      }
    },
    [],
  );

  const handleProcess = useCallback(async () => {
    if (!questionFile || !answerFile) return;

    setScreen("loading");
    setProcessingError(null);

    try {
      const formData = new FormData();
      formData.append("questionPaper", questionFile);
      formData.append("answerSheet", answerFile);

      const res = await fetch("/api/process-exam", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Server error ${res.status}`);
      }

      const data: ProcessExamResponse = await res.json();
      setExamData(data);

      if (answerSheetUrl) URL.revokeObjectURL(answerSheetUrl);
      const url = URL.createObjectURL(answerFile);
      setAnswerSheetUrl(url);

      setScreen("mapping");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Processing failed.";
      setProcessingError(message);
      setScreen("upload");
    }
  }, [questionFile, answerFile, answerSheetUrl]);

  const handleBackToUpload = useCallback(() => {
    setScreen("upload");
    setExamData(null);
    setProcessingError(null);
  }, []);

  if (!hydrated) {
    return <div className="h-dvh bg-[#f7f7f7]" />;
  }

  const bothUploaded = questionPaper !== null && answerSheet !== null;

  return (
    <>
      <DashboardLayout
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onBack={screen === "mapping" ? handleBackToUpload : undefined}
      >
        {screen === "upload" && (
          <UploadPage
            questionPaper={questionPaper}
            answerSheet={answerSheet}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onStartMapping={handleProcess}
            bothUploaded={bothUploaded}
            processingError={processingError}
          />
        )}
        {screen === "mapping" && examData && answerSheetUrl && (
          <MappingWorkspace
            examData={examData}
            answerSheetUrl={answerSheetUrl}
            onBack={handleBackToUpload}
          />
        )}
      </DashboardLayout>
      {screen === "loading" && <ExtractionLoader onDone={() => {}} />}
    </>
  );
}
