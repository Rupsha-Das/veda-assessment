import OpenAI from "openai";
import type { OCRBlock, Question } from "@/types/exam";
import type { AnswerAssociation } from "./segmentAnswersWithOpenAI";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export type QuestionEvaluation = {
  questionNumber: string;
  maxMarks: number;
  marksObtained: number;
  feedback: string;
};

const EVALUATION_SCHEMA = {
  type: "object" as const,
  properties: {
    evaluations: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          questionNumber: { type: "string" as const },
          maxMarks: { type: "number" as const },
          marksObtained: { type: "number" as const },
          feedback: { type: "string" as const },
        },
        required: ["questionNumber", "maxMarks", "marksObtained", "feedback"],
        additionalProperties: false,
      },
    },
  },
  required: ["evaluations"],
  additionalProperties: false,
};

const STOP_WORDS = new Set(
  "a an the and or to of in on for with is are was were how what why when where describe explain discuss state identify name any from into this that their they it its".split(
    " ",
  ),
);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function defaultMaxMarks(question: Question): number {
  if (question.maxMarks !== undefined) return question.maxMarks;
  const length = words(question.text).length;
  return length > 18 ? 5 : length > 8 ? 3 : 2;
}

function evaluateLocally(
  questions: Question[],
  answers: AnswerAssociation[],
  blocks: OCRBlock[],
): QuestionEvaluation[] {
  const blockMap = new Map(blocks.map((block) => [block.id, block]));
  const answerByNumber = new Map(
    answers.map((answer) => [
      answer.questionNumber,
      answer.blockIds
        .map((id) => blockMap.get(id)?.text)
        .filter(Boolean)
        .join(" "),
    ]),
  );

  return questions.map((question) => {
    const maximum = defaultMaxMarks(question);
    const answer = answerByNumber.get(question.number)?.trim() ?? "";
    const questionWords = new Set(words(question.text));
    const answerWords = new Set(words(answer));
    const matched = [...questionWords].filter((word) => answerWords.has(word));
    const coverage = questionWords.size ? matched.length / questionWords.size : 0;
    const obtained = answer
      ? Math.min(maximum, Math.max(0, Math.round(maximum * Math.min(1, coverage * 1.8))))
      : 0;
    const missing = [...questionWords].filter((word) => !answerWords.has(word)).slice(0, 3);
    const topic = matched.slice(0, 3).join(", ") || "the key concepts";

    let feedback: string;
    if (!answer) {
      feedback = `No answer was found for this question, so it could not be evaluated.`;
    } else if (obtained === maximum) {
      feedback = `Your answer addresses the key points of this question, including ${topic}, and is complete for the marks available.`;
    } else if (obtained > 0) {
      feedback = `Good attempt. Your answer addresses ${topic}, but it should also cover ${missing.join(", ") || "the remaining parts of the question"} to be complete.`;
    } else {
      feedback = `Your answer does not yet address the key requirements of this question. Review ${missing.join(", ") || "the relevant concepts"} and answer each part directly.`;
    }

    return { questionNumber: question.number, maxMarks: maximum, marksObtained: obtained, feedback };
  });
}

export async function evaluateAnswersWithOpenAI({
  questions,
  answers,
  blocks,
}: {
  questions: Question[];
  answers: AnswerAssociation[];
  blocks: OCRBlock[];
}): Promise<QuestionEvaluation[]> {
  const blockMap = new Map(blocks.map((block) => [block.id, block]));
  const answerText = answers.map((answer) => ({
    questionNumber: answer.questionNumber,
    answer: answer.blockIds
      .map((id) => blockMap.get(id)?.text)
      .filter(Boolean)
      .join("\n"),
  }));

  if (!openai) return evaluateLocally(questions, answers, blocks);

  try {
    const response = await openai.responses.parse({
    model: "gpt-4o",
    instructions: `Evaluate each answer against its question.

- Infer the maximum marks from the question's stated marks when present; otherwise use the most appropriate whole-number value for the question.
- Award only marks supported by the answer. Never award marks just because an answer region exists.
- Keep marksObtained between 0 and maxMarks.
- Write concise, question-specific feedback based on the answer.
- For unanswered questions, return zero and explain what is missing.
- Return one evaluation for every question, including unanswered questions.`,
    input: JSON.stringify({
      questions: questions.map(({ number, text, maxMarks }) => ({
        number,
        text,
        maximumMarks: maxMarks,
      })),
      answers: answerText,
    }),
    text: {
      format: {
        type: "json_schema",
        name: "answer_evaluations",
        strict: true,
        schema: EVALUATION_SCHEMA,
      },
    },
    reasoning: { effort: "low" },
    temperature: 0,
    });

  const parsed = response.output_parsed as {
    evaluations: QuestionEvaluation[];
  } | null;

    if (!parsed) throw new Error("OpenAI returned empty evaluation output");

    return parsed.evaluations.map((evaluation) => {
    const maxMarks = Math.max(0, Math.round(evaluation.maxMarks));
    return {
      ...evaluation,
      maxMarks,
      marksObtained: Math.max(
        0,
        Math.min(maxMarks, Math.round(evaluation.marksObtained)),
      ),
    };
    });
  } catch (error) {
    console.error("[evaluation] OpenAI evaluation failed; using local fallback:", error);
    return evaluateLocally(questions, answers, blocks);
  }
}
