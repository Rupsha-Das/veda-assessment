import { describe, it, expect } from "vitest";
import {
  extractQuestions,
  normalizeQuestionNumberPublic,
  getBaseQuestionNumber,
} from "../extractQuestions";
import type { OCRDocument, OCRBlock } from "@/types/exam";

function makeBlock(
  id: string,
  text: string,
  pageIndex = 0,
  blockIndex = 0,
  x = 0.1,
  y = 0.1,
  width = 0.8,
  height = 0.05,
  type: OCRBlock["type"] = "text",
): OCRBlock {
  return {
    id,
    pageIndex,
    blockIndex,
    type,
    text,
    box: { x, y, width, height },
  };
}

function makeDoc(
  pageBlocks: { text: string; page?: number; x?: number; y?: number; h?: number; type?: OCRBlock["type"] }[][],
): OCRDocument {
  return {
    pages: pageBlocks.map((blocks, pageIndex) => ({
      pageIndex,
      width: 800,
      height: 1100,
      blocks: blocks.map((b, i) =>
        makeBlock(
          `p${pageIndex}-b${i}`,
          b.text,
          b.page ?? pageIndex,
          i,
          b.x ?? 0.1,
          b.y ?? (0.05 + i * 0.06),
          0.8,
          b.h ?? 0.05,
          b.type ?? "text",
        ),
      ),
    })),
  };
}

describe("extractQuestions", () => {
  describe("instructions are ignored", () => {
    it("ignores 'Answer all questions'", () => {
      const doc = makeDoc([
        [
          { text: "Answer all questions." },
          { text: "1. What is photosynthesis?" },
          { text: "2. Define mitosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const texts = questions.map((q) => q.text);
      expect(texts.some((t) => /answer\s+all/i.test(t))).toBe(false);
      expect(questions.map((q) => q.number)).toContain("1");
      expect(questions.map((q) => q.number)).toContain("2");
    });

    it("ignores 'Draw neat and labelled diagrams'", () => {
      const doc = makeDoc([
        [
          { text: "Draw neat and labelled diagrams wherever required." },
          { text: "1. Label the parts of a flower." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const texts = questions.map((q) => q.text);
      expect(texts.some((t) => /draw\s+neat/i.test(t))).toBe(false);
    });

    it("ignores instructions before questions", () => {
      const doc = makeDoc([
        [
          { text: "Answer all questions." },
          { text: "Draw neat and labelled diagrams wherever required." },
          { text: "1. What is DNA?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("1");
    });

    it("ignores numbered instruction '1. Answer all questions'", () => {
      const doc = makeDoc([
        [
          { text: "1. Answer all questions." },
          { text: "2. What is photosynthesis?" },
          { text: "3. Define mitosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).not.toContain("1");
      expect(numbers).toContain("2");
      expect(numbers).toContain("3");
    });

    it("ignores numbered instruction '2. Draw neat and labelled diagrams'", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?" },
          { text: "2. Draw neat and labelled diagrams wherever required." },
          { text: "3. Define mitosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).toContain("1");
      expect(numbers).not.toContain("2");
      expect(numbers).toContain("3");
    });

    it("ignores container instruction '11. Answer the following:' but keeps sub-parts", () => {
      const doc = makeDoc([
        [
          { text: "11. Answer the following:" },
          { text: "(a). Explain diffusion." },
          { text: "(b). Explain osmosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).not.toContain("11");
      expect(numbers).toContain("11(a)");
      expect(numbers).toContain("11(b)");
    });

    it("ignores numbered instruction with no question number following", () => {
      const doc = makeDoc([
        [
          { text: "1. Answer all questions." },
          { text: "2. Attempt all questions." },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(0);
    });

    it("ignores numbered 'solve the following' instruction", () => {
      const doc = makeDoc([
        [
          { text: "1. Solve the following:" },
          { text: "2. What is gravity?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).not.toContain("1");
      expect(numbers).toContain("2");
    });

    it("ignores numbered 'read the following' instruction", () => {
      const doc = makeDoc([
        [
          { text: "1. Read the following passage and answer." },
          { text: "2. What is photosynthesis?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).not.toContain("1");
      expect(numbers).toContain("2");
    });
  });

  describe("section headings are ignored", () => {
    it("ignores section headings", () => {
      const doc = makeDoc([
        [
          { text: "Section A - Multiple Choice Questions" },
          { text: "1. What is the powerhouse of the cell?" },
          { text: "Section B - Short Answer Questions" },
          { text: "2. Explain photosynthesis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const texts = questions.map((q) => q.text);
      expect(texts.some((t) => /section\s+a/i.test(t))).toBe(false);
      expect(texts.some((t) => /section\s+b/i.test(t))).toBe(false);
      expect(questions.map((q) => q.number)).toContain("1");
      expect(questions.map((q) => q.number)).toContain("2");
    });

    it("ignores ## section markers", () => {
      const doc = makeDoc([
        [
          { text: "## Section A - MCQ" },
          { text: "1. What is photosynthesis?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].text).not.toContain("##");
    });
  });

  describe("metadata is ignored", () => {
    it("ignores class/subject info", () => {
      const doc = makeDoc([
        [
          { text: "CLASS 10 - BIOLOGY" },
          { text: "Maximum Marks: 40" },
          { text: "1. What is a cell?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("1");
    });

    it("ignores marks info lines", () => {
      const doc = makeDoc([
        [
          { text: "(1 x 8 = 8 marks)" },
          { text: "1. What is DNA?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("1");
    });

    it("ignores **Total: 40 Marks**", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?" },
          { text: "**Total: 40 Marks**" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].text).not.toContain("Total");
    });
  });

  describe("question extraction", () => {
    it("extracts numbered questions", () => {
      const doc = makeDoc([
        [
          { text: "1. What is photosynthesis?" },
          { text: "2. Define mitosis." },
          { text: "3. Name the organelles." },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.map((q) => q.number)).toEqual(["1", "2", "3"]);
    });

    it("preserves printed order", () => {
      const doc = makeDoc([
        [
          { text: "3. Third question" },
          { text: "1. First question" },
          { text: "2. Second question" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.map((q) => q.number)).toEqual(["3", "1", "2"]);
    });

    it("extracts question with 'Q.' prefix", () => {
      const doc = makeDoc([[{ text: "Q1. What is DNA?" }]]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("1");
    });

    it("extracts question with 'Question' prefix", () => {
      const doc = makeDoc([[{ text: "Question 5: What is RNA?" }]]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("5");
    });

    it("extracts question with ')' delimiter", () => {
      const doc = makeDoc([[{ text: "1) What is a cell?" }]]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("1");
    });
  });

  describe("multi-line questions", () => {
    it("keeps multi-line questions together", () => {
      const doc = makeDoc([
        [
          { text: "3. Which blood cells help in", y: 0.1 },
          { text: "fighting infections?", y: 0.16 },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(1);
      expect(questions[0].number).toBe("3");
      expect(questions[0].text).toContain("fighting infections");
    });

    it("separates questions on different lines", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?", y: 0.1 },
          { text: "2. What is RNA?", y: 0.3 },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(2);
    });
  });

  describe("sub-part detection", () => {
    it("detects sub-parts like 11(a) and 11(b)", () => {
      const doc = makeDoc([
        [
          { text: "11(a). Explain diffusion." },
          { text: "11(b). Explain osmosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).toContain("11(a)");
      expect(numbers).toContain("11(b)");
    });

    it("detects standalone sub-parts (a), (b)", () => {
      const doc = makeDoc([
        [
          { text: "11. Answer the following:" },
          { text: "(a). Explain diffusion." },
          { text: "(b). Explain osmosis." },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).toContain("11(a)");
      expect(numbers).toContain("11(b)");
    });

    it("detects numeric sub-parts (i), (ii)", () => {
      const doc = makeDoc([
        [
          { text: "11. Define:" },
          { text: "(i). Osmosis" },
          { text: "(ii). Diffusion" },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(numbers).toContain("11(i)");
      expect(numbers).toContain("11(ii)");
    });

    it("sub-parts are separate questions", () => {
      const doc = makeDoc([
        [
          { text: "11(a). Photosynthesis" },
          { text: "11(b). Respiration" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(2);
      expect(questions[0].number).not.toBe(questions[1].number);
    });
  });

  describe("no giant combined questions", () => {
    it("does not merge multiple questions into one", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?" },
          { text: "2. What is RNA?" },
          { text: "3. What is a gene?" },
          { text: "4. What is a chromosome?" },
          { text: "5. What is a cell?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      expect(questions.length).toBe(5);
      for (const q of questions) {
        expect(q.text.length).toBeLessThan(100);
      }
    });

    it("question text does not contain other question numbers", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?" },
          { text: "2. What is RNA?" },
          { text: "3. What is a gene?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      const q1 = questions.find((q) => q.number === "1");
      expect(q1).toBeDefined();
      expect(q1!.text).not.toContain("2.");
      expect(q1!.text).not.toContain("3.");
    });
  });

  describe("marks extraction", () => {
    it("extracts marks from question text", () => {
      const doc = makeDoc([
        [{ text: "1. What is photosynthesis? (3 marks)" }],
      ]);
      const questions = extractQuestions(doc);
      expect(questions[0].maxMarks).toBe(3);
    });

    it("extracts marks with square brackets", () => {
      const doc = makeDoc([
        [{ text: "1. Define cell division. [5 marks]" }],
      ]);
      const questions = extractQuestions(doc);
      expect(questions[0].maxMarks).toBe(5);
    });
  });

  describe("no duplicate entries", () => {
    it("does not produce duplicate question numbers", () => {
      const doc = makeDoc([
        [
          { text: "1. What is DNA?" },
          { text: "1. What is RNA?" },
        ],
      ]);
      const questions = extractQuestions(doc);
      const numbers = questions.map((q) => q.number);
      expect(new Set(numbers).size).toBe(numbers.length);
    });
  });
});

describe("normalizeQuestionNumberPublic", () => {
  it("normalizes '11(a)'", () => {
    expect(normalizeQuestionNumberPublic("11(a)")).toBe("11(a)");
  });

  it("normalizes '11 (a)'", () => {
    expect(normalizeQuestionNumberPublic("11 (a)")).toBe("11(a)");
  });

  it("normalizes '1'", () => {
    expect(normalizeQuestionNumberPublic("1")).toBe("1");
  });
});

describe("getBaseQuestionNumber", () => {
  it("extracts base from '11(a)'", () => {
    expect(getBaseQuestionNumber("11(a)")).toBe("11");
  });

  it("extracts base from '1'", () => {
    expect(getBaseQuestionNumber("1")).toBe("1");
  });

  it("extracts base from 'Q5'", () => {
    expect(getBaseQuestionNumber("Q5")).toBe("5");
  });
});
