"use client";

import { useState } from "react";

export function ExpandableSection({
  title,
  count,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-lg text-ink">{title}</span>
        <span className="flex items-center gap-2 text-sm text-ink/50">
          {typeof count === "number" ? `${count}` : null}
          <span className={`transition ${open ? "rotate-180" : ""}`}>▾</span>
        </span>
      </button>
      {open ? <div className="border-t border-ink/5 px-5 py-4">{children}</div> : null}
    </section>
  );
}
