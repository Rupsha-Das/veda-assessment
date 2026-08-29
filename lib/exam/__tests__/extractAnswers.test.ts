import { describe, it, expect } from "vitest";
import {
  flattenAnswerBlocks,
  detectMarkerHint,
  detectBareAnswerNumber,
  isLikelyTopLevelQuestionBlock,
  isSuspiciousTinyAnswer,
  unionBoxes,
  buildRegionsFromBlocks,
} from "../extractAnswers";
import type { OCRDocument, OCRBlock, Question } from "@/types/exam";

function makeBlock(
  id: string,
  text: string,
  pageIndex = 0,
  x = 0.1,
  y = 0.1,
  width = 0.8,
  height = 0.05,
  type: "text" | "header" | "footer" = "text",
): OCRBlock {
  return {
    id,
    pageIndex,
    blockIndex: 0,
    type,
    text,
    box: { x, y, width, height },
  };
}

function makeDoc(
  pageBlocks: { text: string; page?: number }[][],
): OCRDocument {
  return {
    pages: pageBlocks.map((blocks, pageIndex) => ({
      pageIndex,
      width: 800,
      height: 1100,
      blocks: blocks.map((b, i) =>
        makeBlock(`p${pageIndex}-b${i}`, b.text, b.page ?? pageIndex),
      ),
    })),
  };
}

const SAMPLE_QUESTIONS: Question[] = [
  { id: "1", number: "1", text: "What is the powerhouse of the cell? Answer: Mitochondria." },
  { id: "2", number: "2", text: "What is photosynthesis? It is the process of making food." },
  { id: "3", number: "3", text: "Which blood cells fight infections? WBCs fight infections." },
  { id: "4", number: "4", text: "The basic unit of heredity is the gene." },
  { id: "5", number: "5", text: "Which organ removes nitrogenous wastes from the blood? The kidney." },
];

describe("extractAnswers", () => {
  describe("flattenAnswerBlocks", () => {
    it("flattens blocks across pages", () => {
      const doc = makeDoc([
        [{ text: "Block 1" }, { text: "Block 2" }],
        [{ text: "Block 3" }],
      ]);
      const blocks = flattenAnswerBlocks(doc);
      expect(blocks.length).toBe(3);
    });

    it("skips header and footer blocks", () => {
      const headerBlock = makeBlock("p0-b0", "Header", 0, 0.1, 0.1, 0.8, 0.05, "header");
      const contentBlock = makeBlock("p0-b1", "Content", 0, 0.1, 0.2, 0.8, 0.05, "text");
      const footerBlock = makeBlock("p0-b2", "Footer", 0, 0.1, 0.3, 0.8, 0.05, "footer");

      const doc: OCRDocument = {
        pages: [{
          pageIndex: 0,
          width: 800,
          height: 1100,
          blocks: [headerBlock, contentBlock, footerBlock],
        }],
      };

      const blocks = flattenAnswerBlocks(doc);
      expect(blocks.length).toBe(1);
      expect(blocks[0].text).toBe("Content");
    });
  });

  describe("detectMarkerHint", () => {
    it("detects explicit Q markers", () => {
      const hint = detectMarkerHint("Q3. The answer is mitochondria.");
      expect(hint).toEqual({ type: "explicit_question", questionNumber: "3" });
    });

    it("detects bare numbers", () => {
      const hint = detectMarkerHint("1. Mitochondria.");
      expect(hint).toEqual({ type: "bare_number", number: "1" });
    });

    it("returns null for long text without markers", () => {
      const hint = detectMarkerHint(
        "This is a long answer that does not start with a question number and continues for a while.",
      );
      expect(hint).toBeNull();
    });
  });

  describe("detectBareAnswerNumber", () => {
    it("detects bare number with content", () => {
      const num = detectBareAnswerNumber("1. Mitochondria.");
      expect(num).toBe("1");
    });

    it("detects bare number with no content", () => {
      const num = detectBareAnswerNumber("5.");
      expect(num).toBe("5");
    });

    it("returns null for long text", () => {
      const num = detectBareAnswerNumber(
        "This is a very long text that should not be detected as a bare number because it exceeds the character limit.",
      );
      expect(num).toBeNull();
    });
  });

  describe("isLikelyTopLevelQuestionBlock", () => {
    it("detects valid question block with matching content", () => {
      const block = makeBlock("p0-b0", "1. Mitochondria.");
      const result = isLikelyTopLevelQuestionBlock(block.text, SAMPLE_QUESTIONS);
      expect(result).toBe("1");
    });

    it("detects bare number with short content", () => {
      const block = makeBlock("p0-b0", "2. Photosynthesis.");
      const result = isLikelyTopLevelQuestionBlock(block.text, SAMPLE_QUESTIONS);
      expect(result).toBe("2");
    });

    it("returns null for non-matching number", () => {
      const block = makeBlock("p0-b0", "99. Some answer.");
      const result = isLikelyTopLevelQuestionBlock(block.text, SAMPLE_QUESTIONS);
      expect(result).toBeNull();
    });
  });

  describe("isSuspiciousTinyAnswer", () => {
    it("returns true for bare number only", () => {
      const blockMap = new Map([["p0-b0", makeBlock("p0-b0", "3.")]]);
      expect(isSuspiciousTinyAnswer(["p0-b0"], blockMap)).toBe(true);
    });

    it("returns true for empty blocks", () => {
      expect(isSuspiciousTinyAnswer([], new Map())).toBe(true);
    });

    it("returns false for blocks with content", () => {
      const blockMap = new Map([
        ["p0-b0", makeBlock("p0-b0", "1. Mitochondria is the powerhouse of the cell.")],
      ]);
      expect(isSuspiciousTinyAnswer(["p0-b0"], blockMap)).toBe(false);
    });
  });

  describe("unionBoxes", () => {
    it("computes union of multiple blocks", () => {
      const blocks = [
        makeBlock("p0-b0", "A", 0, 0.1, 0.1, 0.3, 0.05),
        makeBlock("p0-b1", "B", 0, 0.5, 0.2, 0.3, 0.05),
      ];
      const box = unionBoxes(blocks);
      expect(box).not.toBeNull();
      expect(box!.x).toBeLessThanOrEqual(0.1);
      expect(box!.y).toBeLessThanOrEqual(0.1);
      expect(box!.x + box!.width).toBeGreaterThanOrEqual(0.8);
      expect(box!.y + box!.height).toBeGreaterThanOrEqual(0.25);
    });

    it("returns null for empty blocks", () => {
      expect(unionBoxes([])).toBeNull();
    });
  });

  describe("buildRegionsFromBlocks", () => {
    it("builds regions grouped by page", () => {
      const blockMap = new Map([
        ["p0-b0", makeBlock("p0-b0", "Answer 1", 0, 0.1, 0.1, 0.8, 0.05)],
        ["p0-b1", makeBlock("p0-b1", "Answer 1 continued", 0, 0.1, 0.2, 0.8, 0.05)],
        ["p1-b0", makeBlock("p1-b0", "Answer 1 page 2", 1, 0.1, 0.1, 0.8, 0.05)],
      ]);
      const regions = buildRegionsFromBlocks(
        ["p0-b0", "p0-b1", "p1-b0"],
        blockMap,
      );
      expect(regions.length).toBe(2);
      expect(regions.map((r) => r.pageIndex).sort()).toEqual([0, 1]);
    });

    it("returns empty for no matching blocks", () => {
      const regions = buildRegionsFromBlocks(["nonexistent"], new Map());
      expect(regions).toEqual([]);
    });
  });

  describe("answer sheet with bare numbers", () => {
    it("detects all bare numbers on a typical answer sheet", () => {
      const doc = makeDoc([
        [
          { text: "1. Mitochondria." },
          { text: "2. Photosynthesis." },
          { text: "3. White blood cells (WBCs)." },
          { text: "4. Gene." },
          { text: "5. Kidney." },
        ],
      ]);
      const blocks = flattenAnswerBlocks(doc);
      const hints = blocks.map((b) => ({
        text: b.text,
        hint: detectMarkerHint(b.text),
      }));

      const bareNumbers = hints
        .filter((h) => h.hint?.type === "bare_number")
        .map((h) => (h.hint as { type: "bare_number"; number: string }).number);

      expect(bareNumbers).toContain("1");
      expect(bareNumbers).toContain("2");
      expect(bareNumbers).toContain("3");
      expect(bareNumbers).toContain("4");
      expect(bareNumbers).toContain("5");
    });
  });
});
