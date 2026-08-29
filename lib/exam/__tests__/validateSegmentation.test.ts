import { describe, it, expect } from "vitest";
import {
  validateSegmentation,
  segmentAnswersDeterministically,
  buildAnswerGroups,
} from "../validateSegmentation";
import type { OCRBlock, Question } from "@/types/exam";
import type { SegmentationResult } from "../segmentAnswersWithOpenAI";

function makeBlock(
  id: string,
  text: string,
  pageIndex = 0,
  x = 0.1,
  y = 0.1,
  width = 0.8,
  height = 0.05,
): OCRBlock {
  return {
    id,
    pageIndex,
    blockIndex: 0,
    type: "text",
    text,
    box: { x, y, width, height },
  };
}

const QUESTIONS: Question[] = [
  { id: "1", number: "1", text: "What is the powerhouse of the cell?" },
  { id: "2", number: "2", text: "What is photosynthesis?" },
  { id: "3", number: "3", text: "Which blood cells fight infections?" },
  { id: "4", number: "4", text: "What is the basic unit of heredity?" },
  { id: "5", number: "5", text: "Which organ removes nitrogenous wastes?" },
];

describe("validateSegmentation", () => {
  it("validates correct segmentation", () => {
    const blocks = [
      makeBlock("p0-b0", "1. Mitochondria."),
      makeBlock("p0-b1", "2. Photosynthesis."),
    ];
    const segmentation: SegmentationResult = {
      answers: [
        { questionNumber: "1", blockIds: ["p0-b0"], confidence: 0.9 },
        { questionNumber: "2", blockIds: ["p0-b1"], confidence: 0.9 },
      ],
      unassignedBlockIds: [],
    };

    const result = validateSegmentation({
      segmentation,
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(2);
    expect(result.answers.map((a) => a.questionNumber).sort()).toEqual(["1", "2"]);
  });

  it("discards answers for unknown questions", () => {
    const blocks = [makeBlock("p0-b0", "99. Something.")];
    const segmentation: SegmentationResult = {
      answers: [
        { questionNumber: "99", blockIds: ["p0-b0"], confidence: 0.9 },
      ],
      unassignedBlockIds: [],
    };

    const result = validateSegmentation({
      segmentation,
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(0);
  });

  it("discards suspicious tiny answers", () => {
    const blocks = [makeBlock("p0-b0", "1.")];
    const segmentation: SegmentationResult = {
      answers: [
        { questionNumber: "1", blockIds: ["p0-b0"], confidence: 0.9 },
      ],
      unassignedBlockIds: [],
    };

    const result = validateSegmentation({
      segmentation,
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(0);
  });

  it("handles sub-part matching", () => {
    const blocks = [makeBlock("p0-b0", "11. The answer is osmosis.")];
    const segmentation: SegmentationResult = {
      answers: [
        { questionNumber: "11", blockIds: ["p0-b0"], confidence: 0.9 },
      ],
      unassignedBlockIds: [],
    };

    const questionsWithSubParts: Question[] = [
      ...QUESTIONS,
      { id: "11(a)", number: "11(a)", text: "Define osmosis." },
      { id: "11(b)", number: "11(b)", text: "Define diffusion." },
    ];

    const result = validateSegmentation({
      segmentation,
      questions: questionsWithSubParts,
      blocks,
    });

    expect(result.answers.length).toBe(1);
    expect(result.answers[0].questionNumber).toBe("11");
  });
});

describe("segmentAnswersDeterministically", () => {
  it("detects explicit Q markers", () => {
    const blocks = [
      makeBlock("p0-b0", "Q1. Mitochondria."),
      makeBlock("p0-b1", "Q2. Photosynthesis."),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(2);
    const numbers = result.answers.map((a) => a.questionNumber).sort();
    expect(numbers).toEqual(["1", "2"]);
  });

  it("detects bare numbers matching questions", () => {
    const blocks = [
      makeBlock("p0-b0", "1. Mitochondria."),
      makeBlock("p0-b1", "2. Photosynthesis."),
      makeBlock("p0-b2", "3. WBCs fight infections."),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBeGreaterThanOrEqual(2);
    const numbers = result.answers.map((a) => a.questionNumber);
    expect(numbers).toContain("1");
    expect(numbers).toContain("2");
  });

  it("groups continuation blocks with current answer", () => {
    const blocks = [
      makeBlock("p0-b0", "1. Mitochondria"),
      makeBlock("p0-b1", "is the powerhouse"),
      makeBlock("p0-b2", "of the cell."),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(1);
    expect(result.answers[0].blockIds.length).toBe(3);
  });

  it("skips unknown question numbers", () => {
    const blocks = [
      makeBlock("p0-b0", "99. Something."),
      makeBlock("p0-b1", "1. Mitochondria."),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(1);
    expect(result.answers[0].questionNumber).toBe("1");
  });

  it("handles mixed Q markers and bare numbers", () => {
    const blocks = [
      makeBlock("p0-b0", "Q1. Mitochondria."),
      makeBlock("p0-b1", "2. Photosynthesis."),
      makeBlock("p0-b2", "Q3. WBCs."),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    expect(result.answers.length).toBe(3);
    const numbers = result.answers.map((a) => a.questionNumber).sort();
    expect(numbers).toEqual(["1", "2", "3"]);
  });
});

describe("buildAnswerGroups", () => {
  it("builds answer groups with regions", () => {
    const blocks = [
      makeBlock("p0-b0", "1. Mitochondria.", 0, 0.1, 0.1, 0.8, 0.05),
      makeBlock("p0-b1", "2. Photosynthesis.", 0, 0.1, 0.2, 0.8, 0.05),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    const groups = buildAnswerGroups({ segmentation: result, blocks });

    expect(groups.length).toBe(2);
    for (const group of groups) {
      expect(group.regions.length).toBeGreaterThan(0);
      for (const region of group.regions) {
        expect(region.pageIndex).toBe(0);
        expect(region.box).toBeDefined();
        expect(region.box.x).toBeGreaterThanOrEqual(0);
        expect(region.box.y).toBeGreaterThanOrEqual(0);
        expect(region.box.width).toBeGreaterThan(0);
        expect(region.box.height).toBeGreaterThan(0);
      }
    }
  });

  it("handles multi-page answers", () => {
    const blocks = [
      makeBlock("p0-b0", "1. Mitochondria is the", 0, 0.1, 0.1, 0.8, 0.05),
      makeBlock("p1-b0", "powerhouse of the cell.", 1, 0.1, 0.1, 0.8, 0.05),
    ];

    const result = segmentAnswersDeterministically({
      questions: QUESTIONS,
      blocks,
    });

    const groups = buildAnswerGroups({ segmentation: result, blocks });

    expect(groups.length).toBe(1);
    expect(groups[0].regions.length).toBe(2);
    const pages = groups[0].regions.map((r) => r.pageIndex).sort();
    expect(pages).toEqual([0, 1]);
  });
});
