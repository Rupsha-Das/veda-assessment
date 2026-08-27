"use client";

import { useState, useEffect, useCallback } from "react";
import type { UploadedFileMeta } from "@/types/mapping";
import type { OCRDocument, ProcessExamResponse } from "@/types/exam";
import DashboardLayout from "@/components/layout/DashboardLayout";
import UploadPage from "@/components/upload/UploadPage";
import ExtractionLoader from "@/components/loading/ExtractionLoader";
import MappingWorkspace from "@/components/mapping/MappingWorkspace";
import {
  loadDraftMetadata,
  loadExamSession,
  saveDraftMetadata,
  saveExamSession,
} from "@/lib/exam/examSession";

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
    let mounted = true;

    const restoreSession = async () => {
      try {
        const draftMetadata = loadDraftMetadata();
        if (draftMetadata) {
          setQuestionPaper(draftMetadata.questionPaper);
          setAnswerSheet(draftMetadata.answerSheet);
        }

        const session = await loadExamSession();
        if (!mounted) return;

        if (session) {
          setQuestionPaper(session.questionPaper);
          setAnswerSheet(session.answerSheet);
          setQuestionFile(session.questionFile);
          setAnswerFile(session.answerFile);
          if (session.examData && session.answerFile) {
            setExamData(session.examData);
            setAnswerSheetUrl(URL.createObjectURL(session.answerFile));
            setScreen("mapping");
          }
        }
      } catch {
        // A storage failure should not prevent a new upload from working.
      } finally {
        if (mounted) setHydrated(true);
      }
    };

    void restoreSession();
    return () => {
      mounted = false;
    };
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
      const nextQuestionPaper = kind === "question" ? file : questionPaper;
      const nextAnswerSheet = kind === "answer" ? file : answerSheet;
      const nextQuestionFile = kind === "question" ? raw : questionFile;
      const nextAnswerFile = kind === "answer" ? raw : answerFile;

      saveDraftMetadata({
        questionPaper: nextQuestionPaper,
        answerSheet: nextAnswerSheet,
      });

      if (kind === "question") {
        setQuestionPaper(file);
        setQuestionFile(raw);
      } else {
        setAnswerSheet(file);
        setAnswerFile(raw);
      }

      void saveExamSession({
        questionPaper: nextQuestionPaper,
        answerSheet: nextAnswerSheet,
        questionFile: nextQuestionFile,
        answerFile: nextAnswerFile,
        examData: null,
      });
    },
    [answerFile, answerSheet, questionFile, questionPaper],
  );

  const handleRemove = useCallback(
    (kind: "question" | "answer") => {
      const nextQuestionPaper = kind === "question" ? null : questionPaper;
      const nextAnswerSheet = kind === "answer" ? null : answerSheet;
      const nextQuestionFile = kind === "question" ? null : questionFile;
      const nextAnswerFile = kind === "answer" ? null : answerFile;

      saveDraftMetadata({
        questionPaper: nextQuestionPaper,
        answerSheet: nextAnswerSheet,
      });

      if (kind === "question") {
        setQuestionPaper(null);
        setQuestionFile(null);
      } else {
        setAnswerSheet(null);
        setAnswerFile(null);
      }

      void saveExamSession({
        questionPaper: nextQuestionPaper,
        answerSheet: nextAnswerSheet,
        questionFile: nextQuestionFile,
        answerFile: nextAnswerFile,
        examData: null,
      });
    },
    [answerFile, answerSheet, questionFile, questionPaper],
  );

  const handleProcess = useCallback(async () => {
    if (!questionFile || !answerFile) return;

    setScreen("loading");
    setProcessingError(null);

    try {
      const uploadForOCR = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/ocr", { method: "POST", body: formData });
        const body = await response.json().catch(() => null) as { ocr?: OCRDocument; error?: string } | null;
        if (!response.ok) throw new Error(body?.error ?? `Server error ${response.status}`);
        if (!body?.ocr) throw new Error("The document could not be read.");
        return body.ocr;
      };
      const [questionOCR, answerOCR] = await Promise.all([
        uploadForOCR(questionFile),
        uploadForOCR(answerFile),
      ]);
      const res = await fetch("/api/process-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionOCR, answerOCR }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `Server error ${res.status}`);
      }

      const data: ProcessExamResponse = await res.json();
      setExamData(data);

      try {
        await saveExamSession({
          questionPaper: questionPaper!,
          answerSheet: answerSheet!,
          questionFile,
          answerFile,
          examData: data,
        });
      } catch {
        // Processing is complete even when browser storage is unavailable.
      }

      if (answerSheetUrl) URL.revokeObjectURL(answerSheetUrl);
      const url = URL.createObjectURL(answerFile);
      setAnswerSheetUrl(url);

      setScreen("mapping");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Processing failed.";
      setProcessingError(message);
      setScreen("upload");
    }
  }, [questionFile, answerFile, answerSheet, answerSheetUrl, questionPaper]);

  const handleBackToUpload = useCallback(async () => {
    // Returning to submission keeps both uploaded files available after a reload.
    saveDraftMetadata({ questionPaper, answerSheet });
    await saveExamSession({
      questionPaper,
      answerSheet,
      questionFile,
      answerFile,
      examData: null,
    });
    setScreen("upload");
    setExamData(null);
    setProcessingError(null);
  }, [answerFile, answerSheet, questionFile, questionPaper]);

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
