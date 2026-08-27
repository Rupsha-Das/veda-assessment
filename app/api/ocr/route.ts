import { NextRequest, NextResponse } from "next/server";
import { runMistralOCR } from "@/lib/mistral/ocr";

export const runtime = "nodejs";
const MAX_SIZE = 4 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["application/pdf", "image/png", "image/jpeg", "image/jpg"]);

export async function POST(request: NextRequest) {
  try {
    if (!process.env.MISTRAL_API_KEY) {
      return NextResponse.json({ error: "Mistral API key is not configured." }, { status: 500 });
    }
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "A document is required." }, { status: 400 });
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type. Please upload PDF, PNG, or JPEG." }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Each file must be smaller than 4 MB for production uploads." }, { status: 413 });
    }
    return NextResponse.json({ ocr: await runMistralOCR(file) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OCR processing failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
