export type NormalizedBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OCRBlockType =
  | "text"
  | "title"
  | "list"
  | "table"
  | "image"
  | "equation"
  | "caption"
  | "code"
  | "aside_text"
  | "references"
  | "signature"
  | "header"
  | "footer"
  | "other";

export type MarkerHint =
  | { type: "explicit_question"; questionNumber: string }
  | { type: "bare_number"; number: string }
  | null;

export type OCRBlock = {
  id: string;
  pageIndex: number;
  blockIndex: number;
  type: OCRBlockType;
  text: string;
  box: NormalizedBox;
  confidence?: number;
  imageId?: string;
  tableId?: string;
  markerHint?: MarkerHint;
};

export type OCRPage = {
  pageIndex: number;
  width: number;
  height: number;
  blocks: OCRBlock[];
};

export type OCRDocument = {
  pages: OCRPage[];
};

export type Question = {
  id: string;
  number: string;
  text: string;
  page?: number;
  maxMarks?: number;
  marksObtained?: number;
  feedback?: string;
};

export type AnswerRegion = {
  pageIndex: number;
  box: NormalizedBox;
  confidence?: number;
};

export type AnswerGroup = {
  questionNumber: string;
  regions: AnswerRegion[];
};

export type ProcessExamResponse = {
  questions: Question[];
  answers: AnswerGroup[];
  answerPages: {
    pageIndex: number;
    width: number;
    height: number;
  }[];
};
