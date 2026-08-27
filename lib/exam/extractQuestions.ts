import type { OCRDocument, Question } from "@/types/exam";

const LINE_QUESTION_RE =
  /^\s*(?:question\s*|q\.?\s*)?(\d{1,3})\s*[.\):]\s*/im;

const CONCAT_QUESTION_RE =
  /(?:^|[\s;])(?:question\s*|q\.?\s*)?(\d{1,3})\s*[.\):]\s+(?=[A-Z])/gm;

type FoundQuestion = {
  number: string;
  startIndex: number;
  afterMarkerIndex: number;
};

function findLineQuestions(text: string): FoundQuestion[] {
  const results: FoundQuestion[] = [];
  const lines = text.split(/\n/);
  let offset = 0;

  for (const line of lines) {
    const match = line.match(LINE_QUESTION_RE);
    if (match && match.index !== undefined) {
      results.push({
        number: match[1],
        startIndex: offset + match.index,
        afterMarkerIndex: offset + match.index + match[0].length,
      });
    }
    offset += line.length + 1;
  }

  return results;
}

function findConcatQuestions(text: string): FoundQuestion[] {
  const results: FoundQuestion[] = [];
  let m: RegExpExecArray | null;
  CONCAT_QUESTION_RE.lastIndex = 0;
  while ((m = CONCAT_QUESTION_RE.exec(text)) !== null) {
    results.push({
      number: m[1],
      startIndex: m.index,
      afterMarkerIndex: m.index + m[0].length,
    });
  }
  return results;
}

function deduplicate(questions: FoundQuestion[]): FoundQuestion[] {
  const seen = new Map<string, FoundQuestion>();
  for (const q of questions) {
    const existing = seen.get(q.number);
    if (!existing || q.startIndex < existing.startIndex) {
      seen.set(q.number, q);
    }
  }
  return Array.from(seen.values()).sort((a, b) => a.startIndex - b.startIndex);
}

export function extractQuestions(doc: OCRDocument): Question[] {
  const allBlocks: { text: string }[] = [];

  for (const page of doc.pages) {
    for (const block of page.blocks) {
      if (block.type === "header" || block.type === "footer") continue;
      allBlocks.push({ text: block.text });
    }
  }

  const combinedText = allBlocks.map((b) => b.text).join("\n");
  const normalizedText = combinedText.replace(/\n/g, " ");

  const lineQuestions = findLineQuestions(combinedText);
  const concatQuestions = findConcatQuestions(normalizedText);

  let useNormalized = false;
  let found: FoundQuestion[];

  if (concatQuestions.length > lineQuestions.length) {
    found = deduplicate(concatQuestions);
    useNormalized = true;
  } else {
    found = deduplicate(lineQuestions);
  }

  if (found.length === 0) return [];

  const workingText = useNormalized ? normalizedText : combinedText;

  const questions: Question[] = [];

  for (let i = 0; i < found.length; i++) {
    const f = found[i];
    const endIdx = i + 1 < found.length ? found[i + 1].startIndex : workingText.length;
    const rawText = workingText.substring(f.afterMarkerIndex, endIdx).trim();
    const text = rawText.replace(/\s+/g, " ").trim();

    questions.push({
      id: f.number,
      number: f.number,
      text: text || `Question ${f.number}`,
    });
  }

  return questions;
}
