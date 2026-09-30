export type SectionScores = {
  summary: number;
  experience: number;
  skills: number;
  education: number;
  formatting: number;
};

export type RewrittenBullet = {
  original: string;
  improved: string;
};

export type CritiqueReport = {
  overall_ats_score: number;
  overall_summary: string;
  strengths: string[];
  weaknesses: string[];
  rewritten_bullets: RewrittenBullet[];
  missing_keywords: string[];
  section_scores: SectionScores;
};

export type CritiqueResponse = {
  report: CritiqueReport;
  truncated: boolean;
  demo: boolean;
};

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public code:
      | "empty_resume"
      | "bad_file"
      | "unsupported_type"
      | "too_large"
      | "rate_limit"
      | "llm_rate_limit"
      | "llm_timeout"
      | "llm_error"
      | "parse_error"
      | "config",
  ) {
    super(message);
    this.name = "AppError";
  }
}
