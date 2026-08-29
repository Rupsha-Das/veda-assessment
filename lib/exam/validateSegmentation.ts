import type { OCRBlock, Question, AnswerGroup } from "@/types/exam";
import type { SegmentationResult, AnswerAssociation } from "./segmentAnswersWithOpenAI";
import {
  buildRegionsFromBlocks,
  isSuspiciousTinyAnswer,
  isLikelyTopLevelQuestionBlock,
  detectBareAnswerNumber,
} from "./extractAnswers";

function normalizeAnswerNumber(value: string): string {
  const match = value.trim().match(/^(?:q(?:uestion)?\s*)?(\d{1,3})/i);
  return match?.[1] ?? value.trim().replace(/[.):\-]+$/, "");
}

export type ValidatedSegmentation = {
  answers: AnswerAssociation[];
  unassignedBlockIds: string[];
  method: "openai" | "deterministic-fallback";
};

export function validateSegmentation({
  segmentation,
  questions,
  blocks,
}: {
  segmentation: SegmentationResult;
  questions: Question[];
  blocks: OCRBlock[];
}): ValidatedSegmentation {
  const validBlockIds = new Set(blocks.map((b) => b.id));
  const validQuestionNumbers = new Set(questions.map((q) => q.number));
  const validBaseNumbers = new Set(
    questions.map((q) => {
      const base = q.number.match(/^(\d{1,3})/)?.[1];
      return base ?? q.number;
    }),
  );
  const assignedBlocks = new Set<string>();
  const blockMap = new Map(blocks.map((b) => [b.id, b]));

  const validatedAnswers: AnswerAssociation[] = [];

  for (const answer of segmentation.answers) {
    const normalizedNumber = normalizeAnswerNumber(answer.questionNumber);
    const answerBaseNumber = normalizedNumber.match(/^(\d{1,3})/)?.[1] ?? normalizedNumber;
    const isValidQuestion =
      validQuestionNumbers.has(answer.questionNumber) ||
      validBaseNumbers.has(answerBaseNumber);

    if (!isValidQuestion) {
      console.warn(
        `[validate] Discarding answer for unknown question Q${answer.questionNumber}`,
      );
      continue;
    }

    const firstBlock = answer.blockIds
      .map((id) => blockMap.get(id))
      .find((block): block is OCRBlock => block !== undefined);

    if (
      firstBlock &&
      /^\d{1,3}\s*[.):]\s*/.test(firstBlock.text.trim()) &&
      !isLikelyTopLevelQuestionBlock(firstBlock.text, questions)
    ) {
      const bare = detectBareAnswerNumber(firstBlock.text);
      if (
        bare &&
        (validQuestionNumbers.has(bare) || validBaseNumbers.has(bare))
      ) {
        // Bare number is valid - keep it
      } else {
        console.warn(
          `[validate] Discarding nested numbered list incorrectly mapped to Q${answer.questionNumber}`,
        );
        continue;
      }
    }

    if (isSuspiciousTinyAnswer(answer.blockIds, blockMap)) {
      console.warn(
        `[validate] Discarding suspicious tiny answer for Q${answer.questionNumber} (only bare number content)`,
      );
      continue;
    }

    const validIds: string[] = [];
    for (const blockId of answer.blockIds) {
      if (!validBlockIds.has(blockId)) {
        console.warn(`[validate] Discarding invalid block ID: ${blockId}`);
        continue;
      }
      if (assignedBlocks.has(blockId)) {
        console.warn(`[validate] Discarding duplicate block ID: ${blockId}`);
        continue;
      }
      assignedBlocks.add(blockId);
      validIds.push(blockId);
    }

    if (validIds.length > 0) {
      validatedAnswers.push({
        questionNumber: normalizedNumber,
        blockIds: validIds,
        confidence: answer.confidence,
      });
    }
  }

  const unassignedBlockIds = blocks
    .filter((b) => !assignedBlocks.has(b.id))
    .map((b) => b.id);

  return {
    answers: validatedAnswers,
    unassignedBlockIds,
    method: "openai",
  };
}

export function segmentAnswersDeterministically({
  questions,
  blocks,
}: {
  questions: Question[];
  blocks: OCRBlock[];
}): ValidatedSegmentation {
  const Q_MARKER_RE = /^q\s*\.?\s*(\d{1,3})\s*[.):\-]?\s*/i;

  type PendingGroup = {
    number: string;
    blockIds: string[];
  };

  const groups: PendingGroup[] = [];
  let current: PendingGroup | null = null;

  for (const block of blocks) {
    const trimmed = block.text.trim();
    let marker: string | null = null;

    const qMatch = trimmed.match(Q_MARKER_RE);
    if (qMatch) {
      marker = qMatch[1];
    } else {
      const lines = trimmed.split(/\n/);
      for (const line of lines) {
        const lt = line.trim();
        if (lt.length > 30) continue;
        const m = lt.match(Q_MARKER_RE);
        if (m) { marker = m[1]; break; }
      }
    }

    if (marker) {
      current = { number: marker, blockIds: [block.id] };
      groups.push(current);
    } else {
      const topLevelNumber = isLikelyTopLevelQuestionBlock(trimmed, questions);
      if (topLevelNumber) {
        current = { number: topLevelNumber, blockIds: [block.id] };
        groups.push(current);
      } else {
        const bareNumber = detectBareAnswerNumber(trimmed);
        if (bareNumber) {
          const validQuestion = questions.find((q) => q.number === bareNumber);
          const validBaseQuestion = questions.find((q) => {
            const base = q.number.match(/^(\d{1,3})/)?.[1];
            return base === bareNumber;
          });
          if (validQuestion || validBaseQuestion) {
            current = { number: bareNumber, blockIds: [block.id] };
            groups.push(current);
          } else if (current) {
            current.blockIds.push(block.id);
          }
        } else if (current) {
          current.blockIds.push(block.id);
        }
      }
    }
  }

  const validQuestionNumbers = new Set(questions.map((q) => q.number));
  const validBaseNumbers = new Set(
    questions.map((q) => {
      const base = q.number.match(/^(\d{1,3})/)?.[1];
      return base ?? q.number;
    }),
  );
  const assignedBlocks = new Set<string>();
  const answers: AnswerAssociation[] = [];
  const blockMap = new Map(blocks.map((b) => [b.id, b]));

  for (const group of groups) {
    const groupBaseNumber = group.number.match(/^(\d{1,3})/)?.[1] ?? group.number;
    const isValid =
      validQuestionNumbers.has(group.number) || validBaseNumbers.has(groupBaseNumber);
    if (!isValid) continue;
    if (isSuspiciousTinyAnswer(group.blockIds, blockMap)) {
      console.warn(
        `[validate] Skipping suspicious tiny answer for Q${group.number} in fallback`,
      );
      continue;
    }
    const validIds = group.blockIds.filter((id) => {
      if (assignedBlocks.has(id)) return false;
      assignedBlocks.add(id);
      return true;
    });
    if (validIds.length > 0) {
      answers.push({
        questionNumber: group.number,
        blockIds: validIds,
        confidence: 0.5,
      });
    }
  }

  const unassignedBlockIds = blocks
    .filter((b) => !assignedBlocks.has(b.id))
    .map((b) => b.id);

  return {
    answers,
    unassignedBlockIds,
    method: "deterministic-fallback",
  };
}

export function buildAnswerGroups({
  segmentation,
  blocks,
}: {
  segmentation: ValidatedSegmentation;
  blocks: OCRBlock[];
}): AnswerGroup[] {
  const blockMap = new Map(blocks.map((b) => [b.id, b]));

  const answerGroups: AnswerGroup[] = [];

  for (const answer of segmentation.answers) {
    const regions = buildRegionsFromBlocks(answer.blockIds, blockMap);
    if (regions.length > 0) {
      answerGroups.push({
        questionNumber: answer.questionNumber,
        regions,
      });
    }
  }

  return answerGroups;
}
