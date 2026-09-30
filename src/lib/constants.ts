export const MAX_RESUME_CHARS = 6000;
export const MAX_JD_CHARS = 4000;
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_REWRITTEN_BULLETS = 5;
export const DEFAULT_RATE_LIMIT_PER_DAY = 5;

/** Confirmed live on Groq (production + free-tier rate-limit table). Override with GROQ_MODEL. */
export const DEFAULT_GROQ_MODEL = "openai/gpt-oss-20b";
export const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
