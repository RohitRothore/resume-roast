"use client";

import type { CritiqueReport } from "@/lib/types";

function scoreColor(score: number) {
  if (score >= 75) return "#2f9e44";
  if (score >= 50) return "#e8590c";
  return "#c92a2a";
}

export function ScoreGauge({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative mx-auto h-40 w-40">
      <svg viewBox="0 0 140 140" className="-rotate-90 h-full w-full">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#f1e6dc"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-4xl font-semibold text-ink">{score}</span>
        <span className="text-xs uppercase tracking-[0.2em] text-ink/50">ATS</span>
      </div>
    </div>
  );
}

export function SectionBars({
  scores,
}: {
  scores: CritiqueReport["section_scores"];
}) {
  const rows: [string, number][] = [
    ["Summary", scores.summary],
    ["Experience", scores.experience],
    ["Skills", scores.skills],
    ["Education", scores.education],
    ["Formatting", scores.formatting],
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {rows.map(([label, value]) => (
        <li key={label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-ink/80">{label}</span>
            <span className="tabular-nums text-ink/60">{value}/10</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ember/10">
            <div
              className="h-full rounded-full bg-ember"
              style={{ width: `${value * 10}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
