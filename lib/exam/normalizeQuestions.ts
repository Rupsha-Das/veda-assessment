import type { Question } from "@/types/exam";

/**
 * The paper's numbering is useful for matching answers, but it is not always
 * suitable for the list UI (for example, 4(i), 4(ii), and repeated OCR hits).
 * Keep the source number for matching and expose a stable ordinal for display.
 */
export function normalizeQuestionList(questions: Question[]): Question[] {
  const groups = new Map<string, Question[]>();

  for (const question of questions) {
    const text = question.text.trim();
    if (
      /^(?:the\s+question\s+paper\s+(?:has|contains|consists\s+of)|marks?\s+are\s+indicated\s+against\s+each\s+question|answer\s+in\s+brief\s+and\s+to\s+the\s+point|answer\s+all\s+questions|attempt\s+all\s+questions|draw\s+neat\s+and\s+labelled\s+diagrams)\b/i.test(text)
    ) {
      continue;
    }
    const baseNumber = question.number.match(/^(\d{1,3})/)?.[1] ?? question.number.trim();
    const group = groups.get(baseNumber) ?? [];
    group.push(question);
    groups.set(baseNumber, group);
  }

  return Array.from(groups.values()).map((group, index) => {
      const first = group[0];
      const uniqueTexts = Array.from(
        new Map(
          group
            .map((question) => question.text.trim())
            .filter(Boolean)
            .map((text) => [text.replace(/\s+/g, " ").toLowerCase(), text]),
        ).values(),
      );

      return {
        ...first,
        id: first.number.match(/^(\d{1,3})/)?.[1] ?? first.id,
        number: first.number.match(/^(\d{1,3})/)?.[1] ?? first.number,
        displayNumber: String(index + 1),
        text: uniqueTexts.join(" "),
      };
    });
}
