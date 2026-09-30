import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GROQ_MODEL,
  MAX_REWRITTEN_BULLETS,
} from "./constants";
import { MOCK_CRITIQUE } from "./mockCritique";
import { buildUserPrompt, JSON_RETRY_PROMPT, SYSTEM_PROMPT } from "./prompts";
import type { CritiqueReport, SectionScores } from "./types";
import { AppError } from "./types";

export type Provider = "groq" | "gemini";

function provider(): Provider {
  return process.env.LLM_PROVIDER === "gemini" ? "gemini" : "groq";
}

export function useMockLlm(): boolean {
  return process.env.USE_MOCK_LLM === "true";
}

export async function generateCritique(
  resumeText: string,
  jobDescription?: string,
): Promise<{ report: CritiqueReport; demo: boolean }> {
  if (useMockLlm()) {
    return { report: MOCK_CRITIQUE, demo: true };
  }

  const userPrompt = buildUserPrompt(resumeText, jobDescription);
  const active = provider();

  try {
    const raw = await completeJson(active, userPrompt);
    return { report: parseCritiqueJson(raw), demo: false };
  } catch (error) {
    throw mapProviderError(error);
  }
}

async function completeJson(active: Provider, userPrompt: string): Promise<string> {
  const first = await callProvider(active, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ]);

  try {
    parseCritiqueJson(first);
    return first;
  } catch {
    const retry = await callProvider(active, [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
      { role: "assistant", content: first },
      { role: "user", content: JSON_RETRY_PROMPT },
    ]);
    return retry;
  }
}

type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

async function callProvider(active: Provider, messages: ChatMessage[]): Promise<string> {
  if (active === "gemini") {
    return callGemini(messages);
  }
  return callGroq(messages);
}

const GROQ_FALLBACK_MODELS = [
  process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
].filter(Boolean) as string[];

const GEMINI_FALLBACK_MODELS = [
  process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
].filter(Boolean) as string[];

async function callGroq(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AppError(
      500,
      "GROQ_API_KEY is not set. Add it to .env.local, or set USE_MOCK_LLM=true.",
      "config",
    );
  }

  const groq = new Groq({ apiKey, timeout: 25_000 });
  let lastErr: unknown;

  // Try candidate models in order if model is deprecated or unavailable
  for (const model of Array.from(new Set(GROQ_FALLBACK_MODELS))) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages,
      });

      const content = completion.choices[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      lastErr = err;
      const msg = JSON.stringify(err).toLowerCase();
      // Continue to next model if model is decommissioned, not found, or invalid
      if (
        msg.includes("model") ||
        msg.includes("decommissioned") ||
        msg.includes("not found") ||
        msg.includes("404") ||
        msg.includes("400")
      ) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new AppError(502, "The model returned an empty response.", "llm_error");
}

async function callGemini(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      500,
      "GEMINI_API_KEY is not set. Add it to .env.local, or set USE_MOCK_LLM=true.",
      "config",
    );
  }

  const system = messages.find((m) => m.role === "system")?.content ?? SYSTEM_PROMPT;
  const rest = messages.filter((m) => m.role !== "system");
  const contents = rest.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const genAI = new GoogleGenerativeAI(apiKey);
  let lastErr: unknown;

  for (const modelName of Array.from(new Set(GEMINI_FALLBACK_MODELS))) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: system,
        generationConfig: {
          temperature: 0.3,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent({ contents });
      const text = result.response.text();
      if (text) return text;
    } catch (err) {
      lastErr = err;
      const msg = err instanceof Error ? err.message.toLowerCase() : "";
      if (msg.includes("model") || msg.includes("not found") || msg.includes("404")) {
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new AppError(502, "The model returned an empty response.", "llm_error");
}

function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = (fenced?.[1] ?? trimmed).trim();
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("no json object");
  }
  return raw.slice(start, end + 1);
}

function clamp(n: unknown, min: number, max: number): number {
  const value = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseSectionScores(value: unknown): SectionScores {
  const obj = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    summary: clamp(obj.summary, 0, 10),
    experience: clamp(obj.experience, 0, 10),
    skills: clamp(obj.skills, 0, 10),
    education: clamp(obj.education, 0, 10),
    formatting: clamp(obj.formatting, 0, 10),
  };
}

export function parseCritiqueJson(text: string): CritiqueReport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(extractJsonPayload(text));
  } catch {
    throw new AppError(
      502,
      "The critique came back in a format we couldn't read. Try again in a moment.",
      "parse_error",
    );
  }

  if (!parsed || typeof parsed !== "object") {
    throw new AppError(502, "The critique came back empty. Try again in a moment.", "parse_error");
  }

  const data = parsed as Record<string, unknown>;
  const bulletsRaw = Array.isArray(data.rewritten_bullets) ? data.rewritten_bullets : [];
  const rewritten_bullets = bulletsRaw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const bullet = item as Record<string, unknown>;
      if (typeof bullet.original !== "string" || typeof bullet.improved !== "string") {
        return null;
      }
      return {
        original: bullet.original.trim(),
        improved: bullet.improved.trim(),
      };
    })
    .filter((item): item is { original: string; improved: string } => Boolean(item))
    .slice(0, MAX_REWRITTEN_BULLETS);

  const summary =
    typeof data.overall_summary === "string" ? data.overall_summary.trim() : "";

  if (!summary) {
    throw new AppError(502, "The critique came back incomplete. Try again in a moment.", "parse_error");
  }

  return {
    overall_ats_score: clamp(data.overall_ats_score, 0, 100),
    overall_summary: summary,
    strengths: asStringArray(data.strengths),
    weaknesses: asStringArray(data.weaknesses),
    rewritten_bullets,
    missing_keywords: asStringArray(data.missing_keywords),
    section_scores: parseSectionScores(data.section_scores),
  };
}

function mapProviderError(error: unknown): AppError {
  console.error("mapProviderError", error);
  if (error instanceof AppError) return error;

  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const status =
    typeof error === "object" && error && "status" in error
      ? Number((error as { status?: number }).status)
      : undefined;

  if (status === 429 || message.includes("rate limit") || message.includes("429")) {
    return new AppError(
      429,
      "The roast queue is a little busy (free-tier rate limit). Try again in a moment.",
      "llm_rate_limit",
    );
  }

  if (
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("deadline")
  ) {
    return new AppError(
      504,
      "That roast took too long. Try again in a moment — shorter resumes help.",
      "llm_timeout",
    );
  }

  return new AppError(
    502,
    "We couldn't finish the roast. Try again in a moment.",
    "llm_error",
  );
}
