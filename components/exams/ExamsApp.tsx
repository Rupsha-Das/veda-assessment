"use client";

import { useState, useEffect } from "react";
import type { Screen, UploadedFileMeta } from "@/types/mapping";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadPage from "@/components/upload/UploadPage";
import ExtractionLoader from "@/components/loading/ExtractionLoader";
import MappingWorkspace from "@/components/mapping/MappingWorkspace";

export default function ExamsApp() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [questionPaper, setQuestionPaper] = useState<UploadedFileMeta | null>(
    null,
  );
  const [answerSheet, setAnswerSheet] = useState<UploadedFileMeta | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(screen === "mapping");
  }, [screen]);

  const handleUpload = (
    kind: "question" | "answer",
    file: UploadedFileMeta,
  ) => {
    if (kind === "question") setQuestionPaper(file);
    else setAnswerSheet(file);
  };

  const handleRemove = (kind: "question" | "answer") => {
    if (kind === "question") setQuestionPaper(null);
    else setAnswerSheet(null);
  };

  return (
    <>
      <DashboardLayout
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
      >
        {screen === "upload" && (
          <UploadPage
            questionPaper={questionPaper}
            answerSheet={answerSheet}
            onUpload={handleUpload}
            onRemove={handleRemove}
            onStartMapping={() => setScreen("loading")}
          />
        )}
        {screen === "mapping" && (
          <MappingWorkspace onBack={() => setScreen("upload")} />
        )}
      </DashboardLayout>
      {screen === "loading" && (
        <ExtractionLoader onDone={() => setScreen("mapping")} />
      )}
    </>
  );
}
