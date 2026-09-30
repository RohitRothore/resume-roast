"use client";

import { useEffect, useMemo, useState } from "react";
import type { CritiqueResponse } from "@/lib/types";
import { CritiqueView } from "./CritiqueView";

const MESSAGES = [
  "Reading the fine print…",
  "Looking for metrics hiding in the bushes…",
  "Checking whether ATS can actually parse this…",
  "Rewriting the weakest bullets…",
  "Keeping it honest, not mean…",
];

export function RoastApp() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CritiqueResponse | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!loading) return;
    const id = window.setInterval(() => setTick((n) => n + 1), 2200);
    return () => window.clearInterval(id);
  }, [loading]);

  const loadingCopy = useMemo(
    () => MESSAGES[tick % MESSAGES.length],
    [tick],
  );

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!file && resumeText.trim().length < 80) {
      setError("Paste your resume or upload a PDF/DOCX first.");
      return;
    }

    setLoading(true);
    setTick(0);

    try {
      const form = new FormData();
      if (file) form.set("file", file);
      form.set("resumeText", resumeText);
      form.set("jobDescription", jobDescription);

      const response = await fetch("/api/critique", {
        method: "POST",
        body: form,
      });

      const data = (await response.json()) as CritiqueResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "Try again in a moment.");
      }

      setResult(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't finish the roast. Try again in a moment.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <CritiqueView
        result={result}
        onReset={() => {
          setResult(null);
          setError(null);
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <label className="block rounded-3xl border border-dashed border-ember/40 bg-white p-6 shadow-sm transition hover:border-ember">
        <span className="font-display text-lg text-ink">Upload a resume</span>
        <p className="mt-1 text-sm text-ink/55">PDF or DOCX, up to 4 MB.</p>
        <input
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="mt-4 block w-full text-sm text-ink/80 file:mr-4 file:rounded-full file:border-0 file:bg-ember file:px-4 file:py-2 file:text-sm file:font-medium file:text-white"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="mt-3 text-sm text-ink/70">Selected: {file.name}</p>
        ) : null}
      </label>

      <div>
        <label htmlFor="resume-text" className="font-display text-lg text-ink">
          Or paste the text
        </label>
        <textarea
          id="resume-text"
          value={resumeText}
          onChange={(event) => setResumeText(event.target.value)}
          rows={10}
          placeholder="Paste your resume here…"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none ring-ember/30 placeholder:text-ink/35 focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="jd" className="font-display text-lg text-ink">
          Target job description{" "}
          <span className="text-sm font-sans font-normal text-ink/45">(optional)</span>
        </label>
        <textarea
          id="jd"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          rows={6}
          placeholder="Paste the JD to get missing keywords…"
          className="mt-2 w-full rounded-2xl border border-ink/10 bg-white px-4 py-3 text-sm leading-relaxed text-ink outline-none ring-ember/30 placeholder:text-ink/35 focus:ring-2"
        />
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center rounded-full bg-ember px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-ember/25 transition hover:bg-ember-dark disabled:cursor-wait disabled:opacity-80 sm:w-auto"
      >
        {loading ? loadingCopy : "Roast my resume"}
      </button>

      {loading ? (
        <div className="overflow-hidden rounded-2xl border border-ink/10 bg-white p-5">
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-ember/10">
            <div className="h-full w-1/3 animate-[progress_1.6s_ease-in-out_infinite] rounded-full bg-ember" />
          </div>
          <p className="text-sm text-ink/60">
            This can take 5–15 seconds on the free-tier model. Hang tight.
          </p>
        </div>
      ) : null}
    </form>
  );
}
