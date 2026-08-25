export type Screen = "upload" | "loading" | "mapping";

export type MobileTab = "questions" | "answersheet";

export type QuestionStatus = "mapped" | "review" | "unmapped";

export interface UploadedFileMeta {
  name: string;
  size: number;
  pages: number;
}

export interface AnswerRegion {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MockQuestion {
  id: number;
  question: string;
  status: QuestionStatus;
  confidence: number;
  score?: string;
  feedback?: string;
  answerExcerpt?: string;
  answerRegion?: AnswerRegion;
}

export type ZoomLevel = 50 | 75 | 100 | 125 | 150;

export const ZOOM_LEVELS: ZoomLevel[] = [50, 75, 100, 125, 150];
export const TOTAL_PAGES = 6;
