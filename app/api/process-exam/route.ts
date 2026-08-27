import { NextRequest, NextResponse } from "next/server";
import { runMistralOCR } from "@/lib/mistral/ocr";
import { extractQuestions } from "@/lib/exam/extractQuestions";
import { flattenAnswerBlocks } from "@/lib/exam/extractAnswers";
import { segmentAnswersWithOpenAI } from "@/lib/exam/segmentAnswersWithOpenAI";
import { evaluateAnswersWithOpenAI } from "@/lib/exam/evaluateAnswersWithOpenAI";
import {
  validateSegmentation,
  segmentAnswersDeterministically,
  buildAnswerGroups,
} from "@/lib/exam/validateSegmentation";
import type { ProcessExamResponse } from "@/types/exam";

export const runtime = "nodejs";

const MAX_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json(
        { error: "Mistral API key is not configured." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const questionPaper = formData.get("questionPaper") as File | null;
    const answerSheet = formData.get("answerSheet") as File | null;

    if (!questionPaper || !answerSheet) {
      return NextResponse.json(
        { error: "Both question paper and answer sheet are required." },
        { status: 400 },
      );
    }

    if (
      !ALLOWED_TYPES.has(questionPaper.type) ||
      !ALLOWED_TYPES.has(answerSheet.type)
    ) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, PNG, or JPEG." },
        { status: 400 },
      );
    }

    if (
      questionPaper.size > MAX_SIZE ||
      answerSheet.size > MAX_SIZE
    ) {
      return NextResponse.json(
        { error: "File size exceeds the 10 MB limit." },
        { status: 400 },
      );
    }

    const [questionOCR, answerOCR] = await Promise.all([
      runMistralOCR(questionPaper),
      runMistralOCR(answerSheet),
    ]);

    const questions = extractQuestions(questionOCR);
    const orderedBlocks = flattenAnswerBlocks(answerOCR);

    console.log(`[process-exam] Extracted ${questions.length} questions:`, questions.map((q) => q.number));
    console.log(`[process-exam] Answer sheet has ${orderedBlocks.length} OCR blocks`);

    let segmentation;

    if (process.env.OPENAI_API_KEY && questions.length > 0 && orderedBlocks.length > 0) {
      try {
        console.log("[process-exam] Attempting OpenAI segmentation...");
        const rawSegmentation = await segmentAnswersWithOpenAI({
          questions,
          blocks: orderedBlocks,
        });
        segmentation = validateSegmentation({
          segmentation: rawSegmentation,
          questions,
          blocks: orderedBlocks,
        });
        console.log(`[process-exam] OpenAI segmentation succeeded: ${segmentation.answers.length} answer groups`);
      } catch (error: unknown) {
        console.error("[process-exam] OpenAI segmentation failed, falling back to deterministic:", error);
        segmentation = segmentAnswersDeterministically({
          questions,
          blocks: orderedBlocks,
        });
      }
    } else {
      console.log("[process-exam] Using deterministic segmentation (no OpenAI key or no data)");
      segmentation = segmentAnswersDeterministically({
        questions,
        blocks: orderedBlocks,
      });
    }

    const answers = buildAnswerGroups({
      segmentation,
      blocks: orderedBlocks,
    });

    let evaluatedQuestions = questions;
    if (questions.length > 0) {
      try {
        const evaluations = await evaluateAnswersWithOpenAI({
          questions,
          answers: segmentation.answers,
          blocks: orderedBlocks,
        });
        const evaluationByNumber = new Map(
          evaluations.map((evaluation) => [evaluation.questionNumber, evaluation]),
        );
        const matchedNumbers = new Set(
          segmentation.answers.map((answer) => answer.questionNumber),
        );
        evaluatedQuestions = questions.map((question) => {
          const evaluation = evaluationByNumber.get(question.number);
          return evaluation && matchedNumbers.has(question.number)
            ? { ...question, ...evaluation }
            : question;
        });
      } catch (error) {
        console.error("[process-exam] Evaluation failed:", error);
      }
    }

    console.log(`[process-exam] Final: ${answers.length} answer groups via ${segmentation.method}`);

    const answerPages = answerOCR.pages.map((p) => ({
      pageIndex: p.pageIndex,
      width: p.width,
      height: p.height,
    }));

    const response: ProcessExamResponse = {
      questions: evaluatedQuestions,
      answers,
      answerPages,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Process exam error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to process exam papers.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
