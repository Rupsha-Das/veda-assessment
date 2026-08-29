"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, AlertCircle, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFileMeta } from "@/types/mapping";

interface FileUploadCardProps {
  kind: "question" | "answer";
  label: React.ReactNode;
  file: UploadedFileMeta | null;
  error: string | null;
  onFileSelected: (file: UploadedFileMeta, raw: File) => void;
  onRemove: () => void;
  onError: (error: string | null) => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb % 1 === 0 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}

export default function FileUploadCard({
  kind,
  label,
  file,
  error,
  onFileSelected,
  onRemove,
  onError,
}: FileUploadCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validate = useCallback(
    (f: File): UploadedFileMeta | string => {
      const ext = f.name.split(".").pop()?.toLowerCase();
      const isPdf = f.type === "application/pdf" || ext === "pdf";
      const isImage = f.type === "image/png" || f.type === "image/jpeg" || f.type === "image/jpg" || ["png", "jpeg", "jpg"].includes(ext ?? "");
      if (!isPdf && !isImage) {
        return "Only PDF, PNG, or JPEG files are supported.";
      }
      if (f.size > 4 * 1024 * 1024) {
        return "For production uploads, each file must be smaller than 4 MB.";
      }
      const pages = isPdf ? Math.max(2, Math.round(f.size / (1024 * 1024))) : 1;
      return { name: f.name, size: f.size, pages };
    },
    [],
  );

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const f = files[0];
      if (!f) return;
      const result = validate(f);
      if (typeof result === "string") {
        onError(result);
      } else {
        onError(null);
        onFileSelected(result, f);
      }
    },
    [validate, onFileSelected, onError],
  );

  return (
    <div className="flex flex-col items-center gap-2">
      {file ? (
        <div className="relative flex w-full items-center gap-3 rounded-2xl border border-[--color-border] bg-white px-4 py-3.5 shadow-sm transition-all">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50">
            {file.name.toLowerCase().endsWith(".pdf") ? (
              <svg viewBox="0 0 24 24" className="size-5 text-red-500" fill="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z" />
                <text x="12" y="17" textAnchor="middle" fontSize="5" fontWeight="bold" fill="currentColor">PDF</text>
              </svg>
            ) : (
              <FileImage className="size-5 text-red-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSize(file.size)} &middot; {file.pages} Pages
            </p>
          </div>
          <button
            type="button"
            aria-label="Remove file"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onError(null);
              onRemove();
            }}
            className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
          >
            <X className="size-3.5" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed bg-white p-4 transition-all",
            isDragging
              ? "border-[#ff633d] bg-[#fff1ec]"
              : "border-gray-300 hover:border-gray-400",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf,image/png,image/jpeg,image/jpg"
            className="sr-only"
            aria-label={kind === "question" ? "Upload Question Paper" : "Upload Answer Sheet"}
            onChange={(e) => {
              handleFiles(e.target.files ?? []);
              e.target.value = "";
            }}
          />
          <div className="flex size-12 items-center justify-center rounded-full bg-gray-50">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">PDF, PNG, or JPEG &middot; Max 4MB</p>
          </div>
        </label>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-500 animate-fade-in">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
