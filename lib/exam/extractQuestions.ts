import type { OCRDocument, OCRBlock, Question } from "@/types/exam";

// ─── Question number patterns ───────────────────────────────────────────────

// Matches: "1.", "1)", "Q1.", "Q1", "Question 1", "Question 1:"
const QUESTION_START_RE =
  /^\s*(?:question\s+|q\.?\s*)?(\d{1,3})\s*[.):\-]?\s*/i;

// Matches: "11(a)", "11 (a)", "11(a).", "11 (a)."
const QUESTION_SUB_PART_RE =
  /^\s*(?:question\s+|q\.?\s*)?(\d{1,3})\s*\(?([a-z]{1,3}|[ivx]{1,5})\)?\s*[.):\-]?\s*/i;

// Matches standalone sub-parts: "(a) ...", "(i) ..."
const STANDALONE_SUB_PART_RE =
  /^\s*\(?([a-z]{1,3}|[ivx]{1,5})\)?\s*[.):\-]\s*/i;

// ─── Content classification ─────────────────────────────────────────────────

const INSTRUCTION_PATTERNS = [
  /^\s*answer\s+all\s+questions?\b/i,
  /^\s*answer\s+(?:any|both|one|two|three|four|five|six|seven|eight|nine|ten)\s+questions?\b/i,
  /^\s*answer\s+the\s+following\b/i,
  /^\s*the\s+question\s+paper\s+(?:has|contains|consists\s+of)\b/i,
  /^\s*marks?\s+(?:are|is)\s+indicated\s+(?:against|for)\s+(?:each|every)\s+question\b/i,
  /^\s*answer\s+(?:in|to)\s+(?:brief|short|one\s+sentence)\b/i,
  /^\s*answer\s+(?:briefly|concisely)\b/i,
  /^\s*(?:do\s+not|please\s+|kindly\s+) write\b/i,
  /^\s*write\s+(?:your|neatly|in\s+neat|with\s+(?:black|blue|dark))\b/i,
  /^\s*(?:use|pen|pencil)\s+(?:black|blue|dark)\b/i,
  /^\s*(?:draw|label)\s+(?:neat|a\s+neat|neatly)\b/i,
  /^\s*(?:fill\s+in|mark\s+the|tick\s+the|choose\s+the|select\s+the|circle\s+the)\b/i,
  /^\s*(?:all\s+questions?\s+are\s+(?:compulsory|mandatory))\b/i,
  /^\s*(?:attempt\s+(?:all|any|both))\b/i,
  /^\s*(?:solve\s+(?:the\s+)?(?:following|any))\b/i,
  /^\s*(?:show\s+your\s+calculations)\b/i,
  /^\s*(?:justify\s+your)\b/i,
  /^\s*(?:give\s+reasons)\b/i,
  /^\s*(?:read\s+the\s+following)\b/i,
  /^\s*(?:internal\s+choices?\s+(?:are|is)\s+provided)\b/i,
  /^\s*(?:use\s+the\s+following)\b/i,
  /^\s*(?:refer\s+to\s+the)\b/i,
  /^\s*(?:just\s+write|write\s+only)\b/i,
  /^\s*(?:note\s*:?)\b/i,
  /^\s*(?:important\s*:?)\b/i,
];

const SECTION_HEADING_PATTERNS = [
  /^\s*(?:section\s+[a-z]|part\s+[a-z0-9]+|module\s+[a-z0-9]+)/i,
  /^\s*(?:unit\s+[a-z0-9]+|chapter\s+[a-z0-9]+)/i,
  /^\s*(?:mcq|multiple\s+choice|very\s+short\s+answer|short\s+answer|long\s+answer|descriptive)\b/i,
  /^\s*(?:objective\s+type|subjective\s+type|fill\s+in|true\s+or\s+false|match\s+the)\b/i,
];

const METADATA_PATTERNS = [
  /^\s*(?:time\s*:?\s*\d|duration\s*:?\s*\d)/i,
  /^\s*(?:total\s+marks|max(?:imum)?\s+marks|marks?\s*:\s*\d)/i,
  /^\s*\d+\s*marks?\s*(?:each|per\s+question)?\s*(?:\)|\])?\s*$/i,
  /^\s*\d+\s*[×x]\s*\d+\s*=\s*\d+\s*$/i,
  /^\s*(?:class\s+\d|grade\s+\d|section\s+\d)/i,
  /^\s*(?:subject|paper|exam|test|course)\s*:/i,
  /^\s*(?:Roll\s+No|Register|Enrol|ID)\s*:/i,
  /^\s*\*{2}.*total.*marks.*\*{2}/i,
];

const SECTION_MARKER_RE = /^##\s*/;

function stripNumberPrefix(text: string): string {
  return text
    .replace(/^\s*(?:question\s+|q\.?\s*)?\d{1,3}\s*[.):\-]?\s*/i, "")
    .replace(/^\s*\(?[a-z]{1,3}\)?\s*[.):\-]\s*/i, "")
    .trim();
}

function classifyLine(text: string): "instruction" | "section_heading" | "metadata" | "marks_info" | "content" {
  const trimmed = text.trim();
  if (trimmed.length === 0) return "content";

  for (const p of SECTION_HEADING_PATTERNS) {
    if (p.test(trimmed)) return "section_heading";
  }
  for (const p of METADATA_PATTERNS) {
    if (p.test(trimmed)) return "metadata";
  }

  if (SECTION_MARKER_RE.test(trimmed)) return "section_heading";
  if (/^\s*\*{2}.*\*{2}\s*$/.test(trimmed)) return "metadata";
  if (/^\s*\d{1,3}\s*marks?\s*$/i.test(trimmed)) return "marks_info";
  if (/^\s*\d{1,3}\s*[×x]\s*\d{1,3}\s*=\s*\d{1,3}\s*$/.test(trimmed)) return "marks_info";

  const stripped = stripNumberPrefix(trimmed);
  for (const p of INSTRUCTION_PATTERNS) {
    if (p.test(stripped)) return "instruction";
  }

  return "content";
}

// ─── Question number parsing ────────────────────────────────────────────────

type ParsedNumber =
  | { kind: "number"; number: string }
  | { kind: "sub_part"; number: string; subPart: string }
  | { kind: "standalone_sub_part"; subPart: string }
  | null;

function parseQuestionNumber(line: string): ParsedNumber {
  const trimmed = line.trim();

  const subPartMatch = trimmed.match(QUESTION_SUB_PART_RE);
  if (subPartMatch) {
    return {
      kind: "sub_part",
      number: subPartMatch[1],
      subPart: subPartMatch[2].toLowerCase(),
    };
  }

  const mainMatch = trimmed.match(QUESTION_START_RE);
  if (mainMatch) {
    return { kind: "number", number: mainMatch[1] };
  }

  const spMatch = trimmed.match(STANDALONE_SUB_PART_RE);
  if (spMatch) {
    return {
      kind: "standalone_sub_part",
      subPart: spMatch[1].toLowerCase(),
    };
  }

  return null;
}

// ─── OCR block → ordered lines ──────────────────────────────────────────────

type TextLine = {
  text: string;
  block: OCRBlock;
  lineIndex: number;
  pageIndex: number;
  y: number;
  x: number;
};

function buildOrderedLines(doc: OCRDocument): TextLine[] {
  const lines: TextLine[] = [];

  for (const page of doc.pages) {
    for (const block of page.blocks) {
      if (block.type === "header" || block.type === "footer") continue;

      const rawLines = block.text.split("\n");
      for (let i = 0; i < rawLines.length; i++) {
        const text = rawLines[i];
        if (text.trim().length === 0) continue;

        lines.push({
          text,
          block,
          lineIndex: i,
          pageIndex: page.pageIndex,
          y: block.box.y + (i / Math.max(rawLines.length, 1)) * block.box.height,
          x: block.box.x,
        });
      }
    }
  }

  lines.sort((a, b) => {
    if (a.pageIndex !== b.pageIndex) return a.pageIndex - b.pageIndex;
    const yDiff = a.y - b.y;
    if (Math.abs(yDiff) > 0.01) return yDiff;
    return a.x - b.x;
  });

  return lines;
}

// ─── Question candidate detection ───────────────────────────────────────────

type QuestionCandidate = {
  number: string;
  lines: TextLine[];
  page: number;
  startLineIndex: number;
};

function detectQuestionCandidates(lines: TextLine[]): QuestionCandidate[] {
  const candidates: QuestionCandidate[] = [];
  let current: QuestionCandidate | null = null;
  let lastParentNumber = "";
  let lastParentLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const classification = classifyLine(line.text);

    if (classification !== "content") {
      if (classification !== "instruction") {
        if (current) {
          if (
            classification === "section_heading" ||
            classification === "metadata" ||
            classification === "marks_info"
          ) {
            if (current.lines.length > 0) {
              candidates.push(current);
            }
            current = null;
          }
        }
      }
      const parsed = parseQuestionNumber(line.text);
      if (parsed && parsed.kind === "number") {
        lastParentNumber = parsed.number;
        lastParentLineIndex = i;
        if (current && current.lines.length > 0) {
          candidates.push(current);
        }
        current = null;
      } else if (parsed && parsed.kind === "sub_part") {
        lastParentNumber = parsed.number;
        lastParentLineIndex = i;
        if (current && current.lines.length > 0) {
          candidates.push(current);
        }
        current = null;
      }
      continue;
    }

    const parsed = parseQuestionNumber(line.text);

    if (parsed) {
      if (parsed.kind === "number") {
        if (current && current.lines.length > 0) {
          candidates.push(current);
        }
        lastParentNumber = parsed.number;
        lastParentLineIndex = i;
        current = {
          number: parsed.number,
          lines: [line],
          page: line.pageIndex,
          startLineIndex: i,
        };
      } else if (parsed.kind === "sub_part") {
        if (current && current.lines.length > 0) {
          candidates.push(current);
        }
        lastParentNumber = parsed.number;
        lastParentLineIndex = i;
        current = {
          number: `${parsed.number}(${parsed.subPart})`,
          lines: [line],
          page: line.pageIndex,
          startLineIndex: i,
        };
      } else if (parsed.kind === "standalone_sub_part") {
        const distance = lastParentLineIndex >= 0 ? i - lastParentLineIndex : Infinity;
        if (lastParentNumber && distance <= 5) {
          if (current && current.lines.length > 0) {
            candidates.push(current);
          }
          current = {
            number: `${lastParentNumber}(${parsed.subPart})`,
            lines: [line],
            page: line.pageIndex,
            startLineIndex: i,
          };
        } else if (current) {
          current.lines.push(line);
        }
      }
    } else {
      if (current) {
        const prevLine = current.lines[current.lines.length - 1];
        const samePage = line.pageIndex === prevLine.pageIndex;
        const verticalGap = line.y - (prevLine.y + (prevLine.block.box.height || 0.02));
        const isCloseVertically = samePage && verticalGap < 0.04;

        if (isCloseVertically) {
          current.lines.push(line);
        } else {
          if (current.lines.length > 0) {
            candidates.push(current);
          }
          current = null;
        }
      }
    }
  }

  if (current && current.lines.length > 0) {
    candidates.push(current);
  }

  return candidates;
}

// ─── Question text assembly ─────────────────────────────────────────────────

function assembleQuestionText(lines: TextLine[]): string {
  const parts: string[] = [];

  for (const line of lines) {
    const classification = classifyLine(line.text);
    if (classification !== "content") continue;

    const parsed = parseQuestionNumber(line.text);
    let text: string;

    if (parsed) {
      if (parsed.kind === "number") {
        text = line.text.replace(QUESTION_START_RE, "").trim();
      } else if (parsed.kind === "sub_part") {
        text = line.text.replace(QUESTION_SUB_PART_RE, "").trim();
      } else {
        text = line.text.replace(STANDALONE_SUB_PART_RE, "").trim();
      }
    } else {
      text = line.text.trim();
    }

    if (text.length > 0) {
      parts.push(text);
    }
  }

  return parts.join(" ").replace(/\s+/g, " ").trim();
}

function getMaxMarks(text: string): number | undefined {
  const match = text.match(/(?:\(|\[)?\s*(\d{1,3})\s*marks?\s*(?:\)|\])?/i);
  return match ? Number(match[1]) : undefined;
}

// ─── Question validation / scoring ──────────────────────────────────────────

type ScoredCandidate = {
  candidate: QuestionCandidate;
  score: number;
};

function scoreCandidate(candidate: QuestionCandidate, allNumbers: string[]): number {
  let score = 0;
  const text = assembleQuestionText(candidate.lines);
  const numStr = candidate.number;

  const baseNum = numStr.match(/^(\d+)/)?.[1];
  if (baseNum) {
    const num = parseInt(baseNum, 10);
    if (num >= 1 && num <= 200) score += 10;
    if (num <= 50) score += 5;
  }

  const isSubPart = /\(/.test(numStr);
  if (isSubPart) score += 2;

  if (text.length > 5) score += 5;
  if (text.length > 15) score += 3;
  if (text.length > 200) score -= 5;
  if (text.length > 500) score -= 15;

  if (/[?]$/.test(text)) score += 3;
  if (/\b(?:what|who|where|when|why|how|which|define|describe|explain|list|name|give|state|differentiate|compare|illustrate|discuss|calculate|solve|prove|draw|label|identify)\b/i.test(text)) {
    score += 4;
  }

  const idx = allNumbers.indexOf(numStr);
  if (idx > 0) {
    const prevNum = allNumbers[idx - 1];
    const prevBase = parseInt(prevNum.match(/^(\d+)/)?.[1] ?? "0", 10);
    const curBase = parseInt(baseNum ?? "0", 10);
    if (curBase === prevBase + 1 || (isSubPart && curBase === prevBase)) {
      score += 5;
    }
  }

  const trimmedLines = candidate.lines.map((l) => l.text.trim());
  const firstLine = trimmedLines[0] ?? "";
  if (/^##\s/.test(firstLine)) score -= 20;
  if (/^\*{2}/.test(firstLine)) score -= 10;

  for (const lt of trimmedLines) {
    const cls = classifyLine(lt);
    if (cls === "instruction") score -= 15;
    if (cls === "section_heading") score -= 20;
    if (cls === "metadata") score -= 10;
    if (cls === "marks_info") score -= 5;
  }

  const hasInstructionPhrase =
    /\b(?:answer\s+all|draw\s+neat|neat\s+and\s+labelled|marks?\s+are\s+indicated|do\s+not\s+write|write\s+neatly)\b/i.test(text);
  if (hasInstructionPhrase) score -= 25;

  return score;
}

function deduplicateByNumber(candidates: QuestionCandidate[]): QuestionCandidate[] {
  const seen = new Map<string, QuestionCandidate>();
  for (const c of candidates) {
    const existing = seen.get(c.number);
    if (!existing || c.startLineIndex < existing.startLineIndex) {
      seen.set(c.number, c);
    }
  }
  return Array.from(seen.values());
}

// ─── Main extraction ────────────────────────────────────────────────────────

export function extractQuestions(doc: OCRDocument): Question[] {
  const lines = buildOrderedLines(doc);
  const candidates = detectQuestionCandidates(lines);
  const deduped = deduplicateByNumber(candidates);

  if (deduped.length === 0) return [];

  const allNumbers = deduped.map((c) => c.number);
  const scored: ScoredCandidate[] = deduped.map((candidate) => ({
    candidate,
    score: scoreCandidate(candidate, allNumbers),
  }));

  const MIN_SCORE = -10;
  const valid = scored.filter((s) => s.score >= MIN_SCORE);

  if (valid.length === 0) return [];

  const questions: Question[] = [];
  const usedNumbers = new Set<string>();

  for (const { candidate } of valid) {
    const num = candidate.number;
    if (usedNumbers.has(num)) continue;
    usedNumbers.add(num);

    const text = assembleQuestionText(candidate.lines);
    if (text.length < 2) continue;

    const maxMarks = getMaxMarks(text);

    questions.push({
      id: num,
      number: num,
      text,
      page: candidate.page,
      ...(maxMarks !== undefined ? { maxMarks } : {}),
    });
  }

  return questions;
}

// ─── Public helper for answer segmentation compatibility ────────────────────

export function normalizeQuestionNumberPublic(number: string): string {
  const match = number.match(/^(\d{1,3})\s*\(?([a-z]{1,3}|[ivx]{1,5})\)?$/i);
  if (match) return `${match[1]}(${match[2].toLowerCase()})`;
  return number.replace(/\s+/g, "").trim();
}

export function getBaseQuestionNumber(number: string): string {
  const match = number.match(/(?:^Q|^q)?\s*(\d{1,3})/);
  return match ? match[1] : number;
}
