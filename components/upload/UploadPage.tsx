"use client";

import { useState, useCallback } from "react";
import type { UploadedFileMeta } from "@/types/mapping";
import TeacherIllustration from "./TeacherIllustration";
import FileUploadCard from "./FileUploadCard";
import StartMappingButton from "./StartMappingButton";

interface UploadPageProps {
  questionPaper: UploadedFileMeta | null;
  answerSheet: UploadedFileMeta | null;
  onUpload: (kind: "question" | "answer", file: UploadedFileMeta, raw: File) => void;
  onRemove: (kind: "question" | "answer") => void;
  onStartMapping: () => void;
  bothUploaded: boolean;
  processingError: string | null;
}

export default function UploadPage({
  questionPaper,
  answerSheet,
  onUpload,
  onRemove,
  onStartMapping,
  bothUploaded,
  processingError,
}: UploadPageProps) {
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const handleUpload = useCallback(
    (kind: "question" | "answer", file: UploadedFileMeta, raw: File) => {
      onUpload(kind, file, raw);
    },
    [onUpload],
  );

  return (
    <div className="flex min-h-full flex-col items-center px-4 py-2 md:py-3">
      <h1 className="font-heading text-center text-2xl font-bold tracking-[-0.03em] text-foreground md:text-[28px]">
        Upload{" "}
        <span className="text-[#ff633d]">
          Question Paper &amp; Answer Sheets
        </span>
      </h1>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Upload both files to get started
      </p>

      <div className="my-2 md:my-3">
        <TeacherIllustration />
      </div>

      <div className="grid w-full max-w-[540px] grid-cols-1 gap-3 sm:grid-cols-2">
        <FileUploadCard
          kind="question"
          label={
            <>
              Upload{" "}
              <span className="text-[#ff633d]">
                Question Paper
              </span>
            </>
          }
          file={questionPaper}
          error={questionError}
          onFileSelected={(f, raw) => handleUpload("question", f, raw)}
          onRemove={() => onRemove("question")}
          onError={setQuestionError}
        />
        <FileUploadCard
          kind="answer"
          label={
            <>
              Upload{" "}
              <span className="text-[#ff633d]">Answer Sheet</span>
            </>
          }
          file={answerSheet}
          error={answerError}
          onFileSelected={(f, raw) => handleUpload("answer", f, raw)}
          onRemove={() => onRemove("answer")}
          onError={setAnswerError}
        />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <StartMappingButton
          disabled={!bothUploaded}
          onClick={onStartMapping}
        />
        {processingError && (
          <p className="text-center text-sm text-red-500">{processingError}</p>
        )}
        <p className="text-center text-xs text-muted-foreground">
          Once both files are uploaded, you&apos;ll be able to map answers
          with questions
        </p>
      </div>
    </div>
  );
}
