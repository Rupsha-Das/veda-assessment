import type {
  OCRDocument,
  OCRBlock,
  NormalizedBox,
  AnswerGroup,
  AnswerRegion,
  MarkerHint,
  Question,
} from "@/types/exam";

const Q_MARKER_RE =
  /^q\s*\.?\s*(\d{1,3})\s*[.):\-]?\s*/i;

const BARE_NUMBER_RE =
  /^(\d{1,3})\s*[.):]\s*/;

function normalizeWords(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );
}

function hasQuestionTextOverlap(blockText: string, questionText: string) {
  const blockWords = normalizeWords(blockText);
  const questionWords = normalizeWords(questionText);
  if (blockWords.size === 0 || questionWords.size === 0) return false;

  let overlap = 0;
  for (const word of blockWords) {
    if (questionWords.has(word)) overlap += 1;
  }

  return overlap / Math.min(blockWords.size, questionWords.size) >= 0.2;
}

/**
 * Detect whether a block is the start of an answer for a specific question.
 * Uses bare number detection with relaxed validation for answer sheets.
 */
export function isLikelyTopLevelQuestionBlock(
  text: string,
  questions: Question[],
): string | null {
  const match = text.trim().match(BARE_NUMBER_RE);
  if (!match) return null;

  const number = match[1];
  const content = text.trim().slice(match[0].length).trim();

  const question = questions.find((item) => item.number === number);
  if (!question) return null;

  if (content.length >= 3) {
    return hasQuestionTextOverlap(content, question.text) ? number : null;
  }

  if (content.length === 0) return number;

  return number;
}

export function detectExplicitMarker(text: string): string | null {
  const trimmed = text.trim();

  const qMatch = trimmed.match(Q_MARKER_RE);
  if (qMatch) return qMatch[1];

  const lines = trimmed.split(/\n/);
  for (const line of lines) {
    const lineTrimmed = line.trim();
    if (lineTrimmed.length > 30) continue;
    const m = lineTrimmed.match(Q_MARKER_RE);
    if (m) return m[1];
  }

  return null;
}

export function detectBareAnswerNumber(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.length > 40) return null;

  const firstLine = trimmed.split(/\n/)[0]?.trim() ?? "";
  if (firstLine.length > 40) return null;

  const m = firstLine.match(BARE_NUMBER_RE);
  if (!m) return null;

  const content = firstLine.slice(m[0].length).trim();

  if (content.length === 0) return m[1];

  if (content.length > 2) return m[1];

  return null;
}

export function detectMarkerHint(text: string): MarkerHint {
  const explicit = detectExplicitMarker(text);
  if (explicit) {
    return { type: "explicit_question", questionNumber: explicit };
  }

  const bare = detectBareAnswerNumber(text);
  if (bare) return { type: "bare_number", number: bare };

  return null;
}

export function isExplicitQuestionBoundary(text: string): string | null {
  return detectExplicitMarker(text);
}

export function isSuspiciousTinyAnswer(
  blockIds: string[],
  blockMap: Map<string, OCRBlock>,
): boolean {
  const blocks = blockIds
    .map((id) => blockMap.get(id))
    .filter((b): b is OCRBlock => b !== undefined);

  if (blocks.length === 0) return true;

  const text = blocks
    .map((block) => block.text)
    .join(" ")
    .trim();

  if (/^\d{1,3}[.)]?$/.test(text)) return true;

  if (text.length < 3 && blocks.length === 1) return true;

  return false;
}

const IGNORED_TYPES = new Set(["header", "footer"]);

export function flattenAnswerBlocks(doc: OCRDocument): OCRBlock[] {
  const blocks: OCRBlock[] = [];
  for (const page of doc.pages) {
    for (const block of page.blocks) {
      if (IGNORED_TYPES.has(block.type)) continue;
      blocks.push(block);
    }
  }
  return blocks;
}

export function unionBoxes(blocks: OCRBlock[]): NormalizedBox | null {
  if (blocks.length === 0) return null;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const b of blocks) {
    minX = Math.min(minX, b.box.x);
    minY = Math.min(minY, b.box.y);
    maxX = Math.max(maxX, b.box.x + b.box.width);
    maxY = Math.max(maxY, b.box.y + b.box.height);
  }

  const PADDING = 0.005;

  return {
    x: Math.max(0, minX - PADDING),
    y: Math.max(0, minY - PADDING),
    width: Math.min(1, maxX + PADDING) - Math.max(0, minX - PADDING),
    height: Math.min(1, maxY + PADDING) - Math.max(0, minY - PADDING),
  };
}

export function buildRegionsFromBlocks(
  blockIds: string[],
  blockMap: Map<string, OCRBlock>,
): AnswerRegion[] {
  const matchedBlocks = blockIds
    .map((id) => blockMap.get(id))
    .filter((b): b is OCRBlock => b !== undefined);

  if (matchedBlocks.length === 0) return [];

  const byPage = new Map<number, OCRBlock[]>();
  for (const b of matchedBlocks) {
    const existing = byPage.get(b.pageIndex) ?? [];
    existing.push(b);
    byPage.set(b.pageIndex, existing);
  }

  const regions: AnswerRegion[] = [];
  for (const [pageIndex, pageBlocks] of byPage) {
    const box = unionBoxes(pageBlocks);
    if (box) {
      regions.push({ pageIndex, box });
    }
  }

  return regions;
}

export function extractAnswers(doc: OCRDocument): AnswerGroup[] {
  const allBlocks = flattenAnswerBlocks(doc);

  type PendingGroup = {
    number: string;
    blocks: OCRBlock[];
  };

  const groups: PendingGroup[] = [];
  let current: PendingGroup | null = null;

  for (const block of allBlocks) {
    block.markerHint = detectMarkerHint(block.text);

    const explicitNumber = isExplicitQuestionBoundary(block.text);
    if (explicitNumber) {
      current = { number: explicitNumber, blocks: [block] };
      groups.push(current);
    } else if (current) {
      current.blocks.push(block);
    }
  }

  const answerGroups: AnswerGroup[] = [];

  for (const group of groups) {
    const blockIds = group.blocks.map((b) => b.id);
    const regions = buildRegionsFromBlocks(blockIds, new Map(group.blocks.map((b) => [b.id, b])));
    if (regions.length > 0) {
      answerGroups.push({
        questionNumber: group.number,
        regions,
      });
    }
  }

  return answerGroups;
}
