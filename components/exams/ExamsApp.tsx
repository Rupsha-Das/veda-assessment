"use client";

import { useState, useEffect } from "react";
import type { Screen, UploadedFileMeta } from "@/types/mapping";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadPage from "@/components/upload/UploadPage";
import ExtractionLoader from "@/components/loading/ExtractionLoader";
import MappingWorkspace from "@/components/mapping/MappingWorkspace";

const STORAGE_KEY = "veda-exam-state";

interface SavedState {
  screen: Screen;
  questionPaper: UploadedFileMeta | null;
  answerSheet: UploadedFileMeta | null;
}

function saveState(state: SavedState) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

function clearState() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export default function ExamsApp() {
  const [screen, setScreen] = useState<Screen>("upload");
  const [questionPaper, setQuestionPaper] = useState<UploadedFileMeta | null>(null);
  const [answerSheet, setAnswerSheet] = useState<UploadedFileMeta | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore state from sessionStorage on client only
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as SavedState;
        if (parsed.screen === "mapping" || parsed.screen === "upload") {
          setScreen(parsed.screen);
          setQuestionPaper(parsed.questionPaper);
          setAnswerSheet(parsed.answerSheet);
          setSidebarCollapsed(parsed.screen === "mapping");
        }
      }
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    setSidebarCollapsed(screen === "mapping");
  }, [screen]);

  useEffect(() => {
    if (hydrated) {
      saveState({ screen, questionPaper, answerSheet });
    }
  }, [screen, questionPaper, answerSheet, hydrated]);

  const handleUpload = (kind: "question" | "answer", file: UploadedFileMeta) => {
    if (kind === "question") setQuestionPaper(file);
    else setAnswerSheet(file);
  };

  const handleRemove = (kind: "question" | "answer") => {
    if (kind === "question") setQuestionPaper(null);
    else setAnswerSheet(null);
  };

  const handleBackToUpload = () => {
    setScreen("upload");
    clearState();
  };

  // Don't render anything until hydration to prevent flash
  if (!hydrated) {
    return <div className="h-dvh bg-[#f7f7f7]" />;
  }

  return (
    <>
      <DashboardLayout
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
        onBack={handleBackToUpload}
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
          <MappingWorkspace onBack={handleBackToUpload} />
        )}
      </DashboardLayout>
      {screen === "loading" && (
        <ExtractionLoader onDone={() => setScreen("mapping")} />
      )}
    </>
  );
}
