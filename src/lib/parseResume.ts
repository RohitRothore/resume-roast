import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { MAX_FILE_BYTES } from "./constants";
import { AppError } from "./types";

// Polyfill DOMMatrix for serverless Node environment (e.g. Vercel)
if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-expect-error polyfill for serverless Node
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
  };
}

const PDF_TYPE = "application/pdf";
const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function isPdf(name: string, type: string) {
  return type === PDF_TYPE || name.toLowerCase().endsWith(".pdf");
}

function isDocx(name: string, type: string) {
  return type === DOCX_TYPE || name.toLowerCase().endsWith(".docx");
}

export async function extractResumeText(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) {
    throw new AppError(
      400,
      "That file is a bit hefty. Please upload a resume under 4 MB.",
      "too_large",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name || "resume";
  const type = file.type || "";

  try {
    if (isPdf(name, type)) {
      return await extractPdf(buffer);
    }
    if (isDocx(name, type)) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value ?? "";
    }
  } catch (err) {
    console.error("File extraction error:", err);
    throw new AppError(
      400,
      "We couldn't read that file. Try exporting a fresh PDF or DOCX, or paste the text instead.",
      "bad_file",
    );
  }

  throw new AppError(
    400,
    "Please upload a PDF or DOCX resume, or paste the text.",
    "unsupported_type",
  );
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text ?? "";
}

export function normalizeResumeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
}
