"use client";

import { useState, useCallback } from "react";
import type { UploadedFileMeta } from "@/types/mapping";
import TeacherIllustration from "./TeacherIllustration";
import FileUploadCard from "./FileUploadCard";
import StartMappingButton from "./StartMappingButton";

interface UploadPageProps {
  questionPaper: UploadedFileMeta | null;
  answerSheet: UploadedFileMeta | null;
  onUpload: (kind: "question" | "answer", file: UploadedFileMeta) => void;
  onRemove: (kind: "question" | "answer") => void;
  onStartMapping: () => void;
}

export default function UploadPage({
  questionPaper,
  answerSheet,
  onUpload,
  onRemove,
  onStartMapping,
}: UploadPageProps) {
  const [questionError, setQuestionError] = useState<string | null>(null);
  const [answerError, setAnswerError] = useState<string | null>(null);

  const handleUpload = useCallback(
    (kind: "question" | "answer", file: UploadedFileMeta) => {
      onUpload(kind, file);
    },
    [onUpload],
  );

  const bothUploaded = questionPaper !== null && answerSheet !== null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto flex min-h-full w-full max-w-3xl flex-col items-center px-4 py-8 md:py-12">
        <h1 className="text-center text-2xl font-bold tracking-tight text-foreground md:text-[32px]">
          Upload{" "}
          <span className="text-[--color-veda-orange]">
            Question Paper &amp; Answer Sheets
          </span>
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Upload both files to get started
        </p>

        <div className="my-6 md:my-8">
          <TeacherIllustration />
        </div>

        <div className="grid w-full max-w-[540px] grid-cols-1 gap-4 sm:grid-cols-2">
          <FileUploadCard
            kind="question"
            label={
              <>
                Upload{" "}
                <span className="text-[--color-veda-orange]">
                  Question Paper
                </span>
              </>
            }
            file={questionPaper}
            error={questionError}
            onFileSelected={(f) => handleUpload("question", f)}
            onRemove={() => onRemove("question")}
            onError={setQuestionError}
          />
          <FileUploadCard
            kind="answer"
            label={
              <>
                Upload{" "}
                <span className="text-[--color-veda-orange]">Answer Sheet</span>
              </>
            }
            file={answerSheet}
            error={answerError}
            onFileSelected={(f) => handleUpload("answer", f)}
            onRemove={() => onRemove("answer")}
            onError={setAnswerError}
          />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <StartMappingButton
            disabled={!bothUploaded}
            onClick={onStartMapping}
          />
          <p className="text-center text-xs text-muted-foreground">
            Once both files are uploaded, you&apos;ll be able to map answers
            with questions
          </p>
        </div>
      </div>
    </div>
  );
}
