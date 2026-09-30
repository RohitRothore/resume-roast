import { NextResponse } from "next/server";
import { MAX_JD_CHARS, MAX_RESUME_CHARS } from "@/lib/constants";
import { generateCritique } from "@/lib/llm";
import { extractResumeText, normalizeResumeText } from "@/lib/parseResume";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { AppError, type CritiqueResponse } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const limit = checkRateLimit(ip);
    if (!limit.ok) {
      throw new AppError(
        429,
        `You've used today's ${limit.limit} free roasts from this network. Come back tomorrow — our free-tier quota thanks you.`,
        "rate_limit",
      );
    }

    const { resumeText, jobDescription, truncated } = await readInput(request);
    const cleaned = normalizeResumeText(resumeText);

    if (cleaned.length < 80) {
      throw new AppError(
        400,
        "That resume looks empty. Paste more text or upload a PDF/DOCX we can actually read.",
        "empty_resume",
      );
    }

    const { report, demo } = await generateCritique(cleaned, jobDescription);

    const body: CritiqueResponse = { report, truncated, demo };
    return NextResponse.json(body, {
      headers: {
        "X-RateLimit-Limit": String(limit.limit),
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: error.status },
      );
    }

    console.error("critique failed", error);
    return NextResponse.json(
      {
        error: "Something went sideways. Try again in a moment.",
        code: "llm_error",
      },
      { status: 500 },
    );
  }
}

async function readInput(request: Request): Promise<{
  resumeText: string;
  jobDescription?: string;
  truncated: boolean;
}> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file");
    const pasted = String(form.get("resumeText") ?? "");
    const jobDescription = trimTo(String(form.get("jobDescription") ?? ""), MAX_JD_CHARS);

    let resumeText = pasted;
    if (file instanceof File && file.size > 0) {
      resumeText = await extractResumeText(file);
    }

    const { text, truncated } = capText(resumeText, MAX_RESUME_CHARS);
    return { resumeText: text, jobDescription, truncated };
  }

  const json = (await request.json()) as {
    resumeText?: string;
    jobDescription?: string;
  };
  const { text, truncated } = capText(json.resumeText ?? "", MAX_RESUME_CHARS);
  return {
    resumeText: text,
    jobDescription: trimTo(json.jobDescription ?? "", MAX_JD_CHARS),
    truncated,
  };
}

function capText(input: string, max: number): { text: string; truncated: boolean } {
  const text = input.trim();
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max), truncated: true };
}

function trimTo(input: string, max: number): string | undefined {
  const text = input.trim();
  if (!text) return undefined;
  return text.slice(0, max);
}
