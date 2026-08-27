import OpenAI from "openai";
import type { OCRBlock, Question } from "@/types/exam";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

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
1. the known questions from the exam paper
2. OCR blocks from the student's handwritten answer sheet in reading order
3. page numbers and approximate normalized positions for those blocks
4. optional markerHint annotations for each block

Your task is to assign answer-sheet OCR blocks to the exam question they belong to.

CRITICAL RULE ABOUT BARE NUMBERS:

A bare number such as:

"1."
"2."
"3)"
"4"

is NOT an exam-question boundary by itself.

Bare numbers frequently represent:
- numbered points
- steps
- examples
- sub-points
- list items
- table row numbers

Never assign a bare number to Question N merely because the number is N.

Determine its role using:
- the known exam question text
- surrounding OCR content
- semantic topic
- preceding and following blocks
- indentation / x-position
- page order
- nearby explicit Q markers
- numbered-list patterns

Example:

Question 7 asks:
"Describe any three HTML tags."

Answer:

"Three HTML tags:
1. <h1>
2. <p>
3. <a>"

All three numbered lines belong to Question 7.

They MUST NOT be assigned to Questions 1, 2, or 3.

Explicit markers such as:

"Q3"
"Q.3"
"Question 3"

are strong evidence of a new answer.

A bare:

"3."

is only weak evidence.

If uncertain, prefer keeping an ambiguous bare-number block with the surrounding/current answer rather than creating a new question boundary.

Other important rules:
- Use semantic meaning of the surrounding content and the known exam question text.
- Use indentation, page position, nearby blocks, reading order, and list patterns as supporting evidence.
- An answer may continue onto another page.
- A question may contain text, equations, tables, images, or diagrams.
- Keep diagram/image/equation blocks with the surrounding answer when appropriate.
- Students may answer questions out of order.
- A student may skip a question.
- Do not assume every exam question has an answer.
- Never invent OCR block IDs. Only use block IDs supplied in the input.
- Do not generate coordinates.
- Do not rewrite OCR text.
- Do not grade the answer.
- Do not judge whether the answer is correct.
- Your only job is segmentation and association.
- It is acceptable to leave genuinely ambiguous blocks unassigned.

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
  if (trimmed.length > 25) return null;
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

export async function segmentAnswersWithOpenAI({
  questions,
  blocks,
}: {
  questions: Question[];
  blocks: OCRBlock[];
}): Promise<SegmentationResult> {
  const questionsJson = JSON.stringify(
    questions.map((q) => ({ number: q.number, text: q.text })),
    null,
    2,
  );

  const blocksJson = JSON.stringify(buildBlockInput(blocks), null, 2);

  const input = `Known questions from the exam paper:\n${questionsJson}\n\nOCR blocks from the answer sheet in reading order:\n${blocksJson}`;

  const response = await openai.responses.parse({
    model: "gpt-4o",
    instructions: SYSTEM_PROMPT,
    input,
    text: {
      format: {
        type: "json_schema",
        name: "segmentation_result",
        strict: true,
        schema: SEGMENTATION_SCHEMA,
      },
    },
    reasoning: { effort: "low" },
    temperature: 0,
  });

  const parsed = response.output_parsed as SegmentationResult | null;
  if (!parsed) {
    throw new Error("OpenAI returned empty structured output");
  }

  return {
    answers: parsed.answers.map((a: AnswerAssociation) => ({
      questionNumber: a.questionNumber,
      blockIds: a.blockIds,
      confidence: Math.max(0, Math.min(1, a.confidence)),
    })),
    unassignedBlockIds: parsed.unassignedBlockIds,
  };
}
