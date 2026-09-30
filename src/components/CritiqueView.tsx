"use client";

import { useState } from "react";
import type { CritiqueResponse } from "@/lib/types";
import { BulletDiff } from "./BulletDiff";
import { ExpandableSection } from "./ExpandableSection";
import { ScoreGauge, SectionBars } from "./ScoreGauge";

export function CritiqueView({
  result,
  onReset,
}: {
  result: CritiqueResponse;
  onReset: () => void;
}) {
  const { report, truncated, demo } = result;
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = `Resume Roast ATS Score: ${report.overall_ats_score}/100\n\nSummary:\n${report.overall_summary}\n\nTop Strengths:\n${report.strengths.map((s) => `• ${s}`).join("\n")}\n\nWeaknesses:\n${report.weaknesses.map((w) => `• ${w}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-6">
      {demo ? (
        <p className="no-print rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo mode — this is a sample roast. Add a Groq or Gemini key and set
          USE_MOCK_LLM=false for a live critique.
        </p>
      ) : null}
      {truncated ? (
        <p className="no-print rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm text-ink/70">
          We trimmed the resume to 6,000 characters so the free-tier model stays
          fast and within quota.
        </p>
      ) : null}

      <div className="print-container rounded-3xl border border-ink/10 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
          <ScoreGauge score={report.overall_ats_score} />
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-display text-2xl text-ink">The roast, professionally plated</p>
              <div className="no-print flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-cream hover:text-ink"
                  title="Copy summary to clipboard"
                >
                  {copied ? "Copied!" : "📋 Copy"}
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="rounded-full border border-ink/10 bg-white px-3 py-1.5 text-xs font-medium text-ink/70 hover:bg-cream hover:text-ink"
                  title="Export report as PDF"
                >
                  📄 Export PDF
                </button>
              </div>
            </div>
            <p className="leading-relaxed text-ink/75">{report.overall_summary}</p>
            <SectionBars scores={report.section_scores} />
          </div>
        </div>
      </div>

      <ExpandableSection title="Strengths" count={report.strengths.length} defaultOpen>
        <ul className="space-y-3">
          {report.strengths.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
              {item}
            </li>
          ))}
        </ul>
      </ExpandableSection>

      <ExpandableSection title="Weaknesses" count={report.weaknesses.length} defaultOpen>
        <ul className="space-y-3">
          {report.weaknesses.map((item) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink/80">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
              {item}
            </li>
          ))}
        </ul>
      </ExpandableSection>

      <ExpandableSection
        title="Rewritten bullets"
        count={report.rewritten_bullets.length}
        defaultOpen
      >
        <BulletDiff bullets={report.rewritten_bullets} />
      </ExpandableSection>

      {report.missing_keywords.length > 0 ? (
        <ExpandableSection
          title="Missing keywords vs. the job"
          count={report.missing_keywords.length}
          defaultOpen
        >
          <div className="flex flex-wrap gap-2">
            {report.missing_keywords.map((keyword) => (
              <span
                key={keyword}
                className="rounded-full bg-ink/[0.06] px-3 py-1 text-sm text-ink/80"
              >
                {keyword}
              </span>
            ))}
          </div>
        </ExpandableSection>
      ) : null}

      <div className="no-print pt-2">
        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-ember hover:text-ember sm:w-auto"
        >
          Roast another resume
        </button>
      </div>
    </div>
  );
}
