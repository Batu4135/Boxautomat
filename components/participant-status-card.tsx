import Link from "next/link";

import type { ParticipantViewStatus } from "@/lib/types";

type ParticipantStatusCardProps = {
  participantStatus: ParticipantViewStatus | null;
};

function StatusPill({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "success" | "warning";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-100"
      : tone === "warning"
        ? "border-amber-300/25 bg-amber-300/12 text-amber-100"
        : "border-white/10 bg-white/8 text-slate-100";

  return (
    <div className={`rounded-[1.4rem] border p-4 ${toneClass}`}>
      <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">{label}</p>
      <p className="mt-2 font-display text-xl text-white sm:text-2xl">{value}</p>
    </div>
  );
}

export function ParticipantStatusCard({
  participantStatus
}: ParticipantStatusCardProps) {
  if (!participantStatus) {
    return (
      <section className="hero-shell relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,18,35,0.9),rgba(11,31,54,0.82))] p-5 shadow-[0_30px_90px_rgba(2,8,23,0.35)] sm:rounded-[2.5rem] sm:p-7">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-beam" aria-hidden="true" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.95)]" />
              Live Board
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/45">Selimiye Bremen</p>
              <h1 className="mt-3 font-display text-[2.4rem] leading-none text-white sm:text-[3.6rem]">
                Rangliste
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Erst Rangliste anschauen, dann per Button neuen Score mit Foto hochladen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatusPill label="Status" value="Bereit" tone="success" />
            <StatusPill label="Upload" value="Offen" />
            <StatusPill label="Frauen" value="Top 6" />
            <StatusPill label="Maenner" value="Top 6" />
          </div>
        </div>
      </section>
    );
  }

  const place =
    participantStatus.state === "ranked"
      ? `#${participantStatus.leaderboardEntry.rank}`
      : participantStatus.state === "pending" && participantStatus.leaderboardEntry
        ? `#${participantStatus.leaderboardEntry.rank}`
        : "--";

  const score =
    participantStatus.state === "ranked"
      ? `${participantStatus.leaderboardEntry.score}`
      : participantStatus.participant.score !== null
        ? `${participantStatus.participant.score}`
        : "--";

  const status =
    participantStatus.state === "pending"
      ? "In Pruefung"
      : participantStatus.state === "approved"
        ? "Freigegeben"
        : "Offiziell";

  const tone =
    participantStatus.state === "pending"
      ? "warning"
      : participantStatus.state === "ranked"
        ? "success"
        : "neutral";

  const boardLabel =
    participantStatus.participant.gender === "female" ? "Frauen Board" : "Maenner Board";

  return (
    <section className="hero-shell relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,18,35,0.9),rgba(11,31,54,0.82))] p-5 shadow-[0_30px_90px_rgba(2,8,23,0.35)] sm:rounded-[2.5rem] sm:p-7">
      <div className="hero-noise" aria-hidden="true" />
      <div className="hero-beam" aria-hidden="true" />

      <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.95)]" />
            Live Board
          </div>

          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-white/45">Selimiye Bremen</p>
            <h1 className="mt-3 font-display text-[2.4rem] leading-none text-white sm:text-[3.6rem]">
              Rangliste
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Direkt sichtbar. Clean. Schnell. Top 6 pro Board.
            </p>
            <div className="mt-4">
              <Link
                href="/?submit=1"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                <span className="text-lg leading-none">+</span>
                Neuer Versuch
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatusPill label="Status" value={status} tone={tone} />
          <StatusPill label="Board" value={boardLabel} />
          <StatusPill label="Platz" value={place} tone={tone} />
          <StatusPill label="Punkte" value={score} />
        </div>
      </div>
    </section>
  );
}
