import type { OCRBlock, Question } from "@/types/exam";
import { openrouterJson } from "@/lib/openrouter/client";

export type AnswerAssociation = {
  questionNumber: string;
  blockIds: string[];
  confidence: number;
};

export type SegmentationResult = {
  answers: AnswerAssociation[];
  unassignedBlockIds: string[];
};

const SYSTEM_PROMPT = `You are segmenting OCR blocks from a handwritten exam answer sheet.

You are given:
1. the known questions from the exam paper (with their numbers and text)
2. OCR blocks from the student's handwritten answer sheet in reading order
3. page numbers and approximate normalized positions for those blocks
4. optional markerHint annotations for each block

Your task is to assign answer-sheet OCR blocks to the exam question they belong to.

CRITICAL RULES:

1. BARE NUMBERS AS QUESTION BOUNDARIES:
On handwritten answer sheets, students commonly write just "1.", "2.", "3." etc. to start their answer to each question. These ARE question boundaries on answer sheets.

A bare number like:
"1."
"2."
"3."
"4."

IS a question boundary on an answer sheet when:
- It appears at the start of a new answer section
- The content that follows is a direct answer (not a numbered list within an answer)
- The vertical position suggests a new answer block

2. DISTINGUISH LIST ITEMS FROM QUESTION BOUNDARIES:
Bare numbers within an answer are list items:
Question 7 asks: "Describe any three HTML tags."
Answer: "Three HTML tags: 1. <h1> 2. <p> 3. <a>"
Here "1.", "2.", "3." are list items belonging to Question 7.

Bare numbers starting a NEW section are question boundaries:
"1. Mitochondria."
"2. Photosynthesis."
"3. White blood cells (WBCs)."
These are answers to Questions 1, 2, and 3.

3. HOW TO DETECT A NEW ANSWER SECTION:
Look for these signals:
- The bare number is followed by a SHORT answer (1-20 words typical for MCQ/short answer)
- There is significant vertical gap from the previous block
- The x-position is similar to other question starts
- The number matches a valid question number
- The content semantically matches the question topic

4. ANSWER SHEET PATTERNS:
Students often write answers in this format:
"1. Answer text"
"2. Answer text"
"3. Answer text"

Each numbered line is a separate answer to the corresponding question.

5. MAPPING RULES:
- Map each answer block to the correct question number
- A student may answer questions out of order
- A student may skip questions
- Do not invent OCR block IDs
- Do not rewrite OCR text
- Do not grade answers
- Keep multi-line answers together
- Keep answer continuation across pages together

6. HANDLING SUB-PARTS:
If the question paper has "11(a)" and "11(b)", but the answer sheet just has "11.", map it to "11" (the base number).

Return only data matching the required structured output schema.`;

const SEGMENTATION_SCHEMA = {
  type: "object" as const,
  properties: {
    answers: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          questionNumber: { type: "string" as const },
          blockIds: {
            type: "array" as const,
            items: { type: "string" as const },
          },
          confidence: { type: "number" as const },
        },
        required: ["questionNumber", "blockIds", "confidence"],
        additionalProperties: false,
      },
    },
    unassignedBlockIds: {
      type: "array" as const,
      items: { type: "string" as const },
    },
  },
  required: ["answers", "unassignedBlockIds"],
  additionalProperties: false,
};

function detectExplicitMarker(text: string): string | null {
  const m = text.trim().match(/^q\s*\.?\s*(\d{1,3})\s*[.):\-]?\s*/i);
  return m ? m[1] : null;
}

function detectBareNumber(text: string): string | null {
  const trimmed = text.trim();
  if (trimmed.length > 40) return null;
  const m = trimmed.match(/^(\d{1,3})\s*[.):]\s*/);
  return m ? m[1] : null;
}

function buildBlockInput(blocks: OCRBlock[]) {
  return blocks.map((b) => {
    const explicit = detectExplicitMarker(b.text);
    const bare = !explicit ? detectBareNumber(b.text) : null;

    const entry: Record<string, unknown> = {
      id: b.id,
      page: b.pageIndex,
      type: b.type,
      text: b.text || (b.type === "image" ? "[IMAGE BLOCK]" : "[EMPTY BLOCK]"),
      x: Math.round(b.box.x * 100) / 100,
      y: Math.round(b.box.y * 100) / 100,
    };

    if (explicit) {
      entry.explicitMarker = { type: "explicit_question", questionNumber: explicit };
    } else if (bare) {
      entry.markerHint = { type: "bare_number", number: bare };
    }

    return entry;
  });
}

function stripSubParts(questions: Question[]): Question[] {
  const baseMap = new Map<string, Question>();

  for (const q of questions) {
    const baseMatch = q.number.match(/^(\d{1,3})/);
    if (baseMatch) {
      const baseNum = baseMatch[1];
      if (!baseMap.has(baseNum)) {
        baseMap.set(baseNum, {
          ...q,
          number: baseNum,
          id: baseNum,
        });
      }
    } else {
      if (!baseMap.has(q.number)) {
        baseMap.set(q.number, q);
      }
    }
  }

  return Array.from(baseMap.values()).sort((a, b) => {
    const numA = parseInt(a.number, 10) || 0;
    const numB = parseInt(b.number, 10) || 0;
    return numA - numB;
  });
}

export async function segmentAnswersWithOpenAI({
  questions,
  blocks,
}: {
  questions: Question[];
  blocks: OCRBlock[];
}): Promise<SegmentationResult> {
  const baseQuestions = stripSubParts(questions);

  const questionsJson = JSON.stringify(
    baseQuestions.map((q) => ({ number: q.number, text: q.text })),
    null,
    2,
  );

  const blocksJson = JSON.stringify(buildBlockInput(blocks), null, 2);

  const input = `Known questions from the exam paper:\n${questionsJson}\n\nOCR blocks from the answer sheet in reading order:\n${blocksJson}`;

  const parsed = await openrouterJson<SegmentationResult>({
    instructions: SYSTEM_PROMPT,
    input,
    schema: SEGMENTATION_SCHEMA,
  });

  return {
    answers: parsed.answers.map((a: AnswerAssociation) => ({
      questionNumber: a.questionNumber,
      blockIds: a.blockIds,
      confidence: Math.max(0, Math.min(1, a.confidence)),
    })),
    unassignedBlockIds: parsed.unassignedBlockIds,
  };
}
