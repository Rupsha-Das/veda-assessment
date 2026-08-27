import { Mistral } from "@mistralai/mistralai";
import type { OCRDocument, OCRBlock, OCRPage } from "@/types/exam";

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY!,
});

function normalizeBox(
  topLeftX: number,
  topLeftY: number,
  bottomRightX: number,
  bottomRightY: number,
  pageWidth: number,
  pageHeight: number,
) {
  const x = Math.max(0, Math.min(1, topLeftX / pageWidth));
  const y = Math.max(0, Math.min(1, topLeftY / pageHeight));
  const w = Math.max(0, Math.min(1 - x, (bottomRightX - topLeftX) / pageWidth));
  const h = Math.max(0, Math.min(1 - y, (bottomRightY - topLeftY) / pageHeight));
  return { x, y, width: w, height: h };
}

function blockType(raw: string): OCRBlock["type"] {
  const t = raw.toLowerCase();
  if (
    t === "text" || t === "title" || t === "list" || t === "table" ||
    t === "image" || t === "equation" || t === "caption" || t === "code" ||
    t === "aside_text" || t === "references" || t === "signature"
  ) return t;
  if (t === "header" || t === "footer") return t;
  return "other";
}

export async function runMistralOCR(file: File): Promise<OCRDocument> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");
  const mime = file.type || "application/pdf";
  const dataUrl = `data:${mime};base64,${base64}`;

  const isImage = mime.startsWith("image/");

  const response = await mistral.ocr.process({
    model: "mistral-ocr-latest",
    document: isImage
      ? { type: "image_url", imageUrl: dataUrl }
      : { type: "document_url", documentUrl: dataUrl },
    includeBlocks: true,
    confidenceScoresGranularity: "block",
  });

  const pages: OCRPage[] = response.pages.map((page) => {
    const dims = page.dimensions;
    const pageWidth = dims?.width ?? 1;
    const pageHeight = dims?.height ?? 1;

    const blocks: OCRBlock[] = (page.blocks ?? []).map((block, blockIndex) => {
      const b = block as Record<string, unknown>;
      const bx = b as {
        topLeftX: number; topLeftY: number;
        bottomRightX: number; bottomRightY: number;
        content: string; type: string;
        imageId?: string; tableId?: string;
        confidenceScores?: {
          averageContentConfidenceScore?: number | null;
        } | null;
      };

      const conf = typeof bx.confidenceScores?.averageContentConfidenceScore === "number"
        ? bx.confidenceScores.averageContentConfidenceScore
        : undefined;

      return {
        id: `p${page.index}-b${blockIndex}`,
        pageIndex: page.index,
        blockIndex,
        type: blockType(bx.type),
        text: bx.content ?? "",
        box: normalizeBox(
          bx.topLeftX ?? 0,
          bx.topLeftY ?? 0,
          bx.bottomRightX ?? 0,
          bx.bottomRightY ?? 0,
          pageWidth,
          pageHeight,
        ),
        confidence: conf,
        imageId: typeof bx.imageId === "string" ? bx.imageId : undefined,
        tableId: typeof bx.tableId === "string" ? bx.tableId : undefined,
      };
    });

    return {
      pageIndex: page.index,
      width: pageWidth,
      height: pageHeight,
      blocks,
    };
  });

  return { pages };
}
