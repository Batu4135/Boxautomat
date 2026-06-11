import Link from "next/link";

import { deleteOwnedParticipantAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { ParticipantRow } from "@/lib/types";

type OwnedEntriesPanelProps = {
  entries: ParticipantRow[];
  returnTo: string;
};

function withQuery(path: string, query: Record<string, string>) {
  const url = new URL(path, "https://boxautomat.local");

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
    </svg>
  );
}

export function OwnedEntriesPanel({ entries, returnTo }: OwnedEntriesPanelProps) {
  if (entries.length === 0) {
    return null;
  }

  return (
    <section className="app-panel px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Dein Bereich</p>
        <h2 className="mt-2 font-display text-2xl text-white">Deine Einträge</h2>
      </div>

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {entry.name}
                </p>
                <span className="rounded-full border border-[#ffd166]/30 bg-[#ffd166]/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-[#ffe4a4]">
                  Von dir erstellt
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                {entry.gender === "female" ? "Frauen" : "Männer"} · {entry.score ?? 0} Punkte
              </p>
            </div>

            <Link
              href={withQuery(returnTo, { submit: "1", edit: entry.id })}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/12"
              aria-label="Eintrag bearbeiten"
            >
              <PencilIcon />
            </Link>

            <form action={deleteOwnedParticipantAction}>
              <input type="hidden" name="id" value={entry.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <FormSubmitButton className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-300/20 bg-rose-500/10 text-rose-100 transition hover:bg-rose-500/15">
                <TrashIcon />
              </FormSubmitButton>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}
