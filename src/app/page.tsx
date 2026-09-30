import { RoastApp } from "@/components/RoastApp";

export default function Home() {
  return (
    <div className="relative min-h-full overflow-hidden">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-ember/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-40 h-64 w-64 rounded-full bg-gold/25 blur-3xl" />

      <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-6">
        <p className="font-display text-xl tracking-tight">
          Resume Roast
          <span className="ml-2 text-ember">🔥</span>
        </p>
        <p className="hidden text-sm text-ink/50 sm:block">Constructive. Specific. Free-tier friendly.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl px-5 pb-20">
        <section className="mb-10 space-y-4">
          <p className="inline-flex rounded-full bg-ember/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-ember">
            Don&apos;t send the first draft
          </p>
          <h1 className="font-display text-4xl leading-tight text-ink sm:text-5xl">
            An honest critique of your resume — not a pile of generic tips.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-ink/70 sm:text-lg">
            Upload a PDF or DOCX, or paste the text. Optionally add a job
            description. We score ATS-readiness, quote what actually works, and
            rewrite the weakest bullets.
          </p>
        </section>
        <RoastApp />
      </main>
    </div>
  );
}
