import Link from "next/link";

import { OwnedDeleteForm } from "@/components/owned-delete-form";
import type { ParticipantRow, ParticipantViewStatus } from "@/lib/types";

type OwnedEntriesPanelProps = {
  entries: ParticipantRow[];
  statuses: ParticipantViewStatus[];
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

function getPlacementText(status: ParticipantViewStatus | undefined) {
  if (!status) {
    return "Wird geprüft";
  }

  if (status.state === "ranked") {
    return `Platz #${status.leaderboardEntry.rank}`;
  }

  if (status.state === "pending" && status.leaderboardEntry) {
    return `Vorläufig Platz #${status.leaderboardEntry.rank}`;
  }

  if (status.state === "approved") {
    return "Freigegeben";
  }

  return "Wird geprüft";
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

export function OwnedEntriesPanel({ entries, statuses, returnTo }: OwnedEntriesPanelProps) {
  if (entries.length === 0) {
    return null;
  }

  const statusById = new Map(statuses.map((status) => [status.participant.id, status]));
  const recoveryCode =
    entries.find((entry) => entry.recovery_code?.trim())?.recovery_code?.trim() ?? null;

  return (
    <section className="app-panel px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Dein Bereich</p>
        <h2 className="mt-2 font-display text-2xl text-white">Deine Einträge</h2>
        {recoveryCode ? (
          <div className="mt-3 rounded-[1.2rem] border border-emerald-300/18 bg-emerald-400/10 px-3 py-3 text-left">
            <p className="text-[10px] uppercase tracking-[0.28em] text-emerald-100/78">
              Sicherungscode
            </p>
            <p className="mt-1 font-display text-lg text-emerald-50">{recoveryCode}</p>
            <p className="mt-1 text-xs leading-5 text-emerald-100/72">
              Damit kannst du deine Einträge wiederherstellen, falls Safari oder Chrome
              Browserdaten löscht.
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2.5">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="flex items-center gap-3 rounded-[1.4rem] border border-white/10 bg-white/[0.05] px-3 py-3"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  {entry.name}
                </p>
                <span className="shrink-0 rounded-full border border-[#ffd166]/30 bg-[#ffd166]/12 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#ffe4a4]">
                  Dein
                </span>
              </div>
              <p className="mt-1 text-xs text-white/55">
                {entry.gender === "female" ? "Damen" : "Männer"} · {entry.score ?? 0} Punkte ·{" "}
                {getPlacementText(statusById.get(entry.id))}
              </p>
            </div>

            <Link
              href={withQuery(returnTo, { submit: "1", edit: entry.id })}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/12"
              aria-label="Eintrag bearbeiten"
            >
              <PencilIcon />
            </Link>

            <OwnedDeleteForm id={entry.id} returnTo={returnTo}>
              <TrashIcon />
            </OwnedDeleteForm>
          </article>
        ))}
      </div>
    </section>
  );
}
