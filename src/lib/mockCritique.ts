import type { CritiqueReport } from "./types";

export const MOCK_CRITIQUE: CritiqueReport = {
  overall_ats_score: 62,
  overall_summary:
    "This resume shows real product and delivery experience, but several bullets read as task lists instead of outcomes. Tighten the summary, add metrics where you already imply impact, and align skills to the language hiring systems actually scan for.",
  strengths: [
    'Quantified ownership in “led a 6-person squad that shipped the billing rewrite” — that sentence is specific and scannable.',
    'The skills section lists concrete tools (TypeScript, PostgreSQL, dbt) rather than only vague categories like “web technologies”.',
    'Education and dates are consistent; there is no unexplained hole between the two most recent roles.',
  ],
  weaknesses: [
    'Several bullets start with “Responsible for…” and never say what changed because you did the work.',
    'The professional summary is three lines of adjectives (“passionate, results-driven”) with almost no domain or stack.',
    'Job titles mix “SDE-2” and “Software Engineer II” without a company-standard title, which confuses ATS matching.',
    'Impact is implied (“improved performance”) without a baseline, a metric, or a time window.',
  ],
  rewritten_bullets: [
    {
      original: "Responsible for working on the dashboard and fixing bugs.",
      improved:
        "Shipped 12 dashboard features and cut P1 bug backlog 40% in two quarters by adding regression tests around the reporting API.",
    },
    {
      original: "Improved performance of the application.",
      improved:
        "Reduced p95 checkout API latency from 1.8s to 420ms by adding query indexes and caching session lookups in Redis.",
    },
    {
      original: "Worked with stakeholders to gather requirements.",
      improved:
        "Ran weekly discovery with sales and CS; translated the top 8 churn drivers into a prioritized roadmap the team shipped in 10 weeks.",
    },
    {
      original: "Used Python for data analysis.",
      improved:
        "Built a Python/dbt pipeline that flagged $1.2M in at-risk renewals two weeks earlier than the previous spreadsheet process.",
    },
  ],
  missing_keywords: [
    "ATS optimization",
    "stakeholder management",
    "A/B testing",
    "SQL",
    "cross-functional",
  ],
  section_scores: {
    summary: 4,
    experience: 6,
    skills: 7,
    education: 8,
    formatting: 6,
  },
};
