"use client";

import type { RewrittenBullet } from "@/lib/types";

export function BulletDiff({ bullets }: { bullets: RewrittenBullet[] }) {
  if (!bullets.length) {
    return <p className="text-sm text-ink/60">No rewrites this round.</p>;
  }

  return (
    <ul className="space-y-4">
      {bullets.map((bullet, index) => (
        <li
          key={`${index}-${bullet.original.slice(0, 24)}`}
          className="grid gap-3 md:grid-cols-2"
        >
          <div className="rounded-xl border border-ink/10 bg-ink/[0.03] p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink/40">
              Before
            </p>
            <p className="text-sm leading-relaxed text-ink/70">{bullet.original}</p>
          </div>
          <div className="rounded-xl border border-ember/20 bg-ember/[0.06] p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ember">
              After
            </p>
            <p className="text-sm leading-relaxed text-ink">{bullet.improved}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
