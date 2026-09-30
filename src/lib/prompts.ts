import { MAX_REWRITTEN_BULLETS } from "./constants";

export const CRITIQUE_JSON_SCHEMA = `{
  "overall_ats_score": number (integer 0-100),
  "overall_summary": string (2-3 sentences, direct and honest, professional not mean),
  "strengths": string[] (3-6 items; quote actual resume phrasing),
  "weaknesses": string[] (3-6 specific issues),
  "rewritten_bullets": { "original": string, "improved": string }[] (3-${MAX_REWRITTEN_BULLETS} of the weakest bullets),
  "missing_keywords": string[] (empty array if no job description was provided),
  "section_scores": {
    "summary": number (0-10),
    "experience": number (0-10),
    "skills": number (0-10),
    "education": number (0-10),
    "formatting": number (0-10)
  }
}`;

export const SYSTEM_PROMPT = `You are Resume Roast, an expert recruiter and ATS specialist. You give specific, constructive resume critiques.

Rules:
- Be professional and constructive. Playful branding is for the product, not the feedback. Never insult the candidate.
- Reference actual text from the resume. Quote phrases. Do not give generic advice that could apply to any resume.
- Output valid JSON only. No markdown, no code fences, no preamble.
- Match this schema exactly:
${CRITIQUE_JSON_SCHEMA}
- Cap rewritten_bullets at ${MAX_REWRITTEN_BULLETS}. Pick the weakest achievement bullets, keep the original wording, and rewrite them with metrics, verbs, and scope.
- If a job description is provided, fill missing_keywords with important JD terms that do not appear in the resume. If no job description, use [].
- Score overall_ats_score for scannability, keywords, quantified impact, and structure — not personality.`;

export function buildUserPrompt(
  resumeText: string,
  jobDescription?: string,
): string {
  const jdBlock = jobDescription?.trim()
    ? `\n\nTARGET JOB DESCRIPTION:\n${jobDescription.trim()}`
    : `\n\nNo job description was provided. Set missing_keywords to [].`;

  return `Critique this resume. Return JSON only.\n\nRESUME:\n${resumeText}${jdBlock}`;
}

export const JSON_RETRY_PROMPT =
  "Your previous reply was not valid JSON. Reply again with a single JSON object only — no markdown fences, no commentary.";
