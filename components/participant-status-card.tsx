import type { ParticipantViewStatus } from "@/lib/types";

type ParticipantStatusCardProps = {
  participantStatus: ParticipantViewStatus;
};

export function ParticipantStatusCard({
  participantStatus
}: ParticipantStatusCardProps) {
  if (participantStatus.state === "pending") {
    return (
      <section className="rounded-[2.25rem] border border-amber-300/15 bg-amber-300/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-amber-100/80">
          Pruefung laeuft
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">
          Hi {participantStatus.participant.name}, dein Upload wartet auf Freigabe
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50/90">
          Deine Punktzahl von {participantStatus.participant.score ?? 0} und dein
          Foto vom Display wurden gespeichert. Das Admin-Team prueft jetzt den
          Eintrag und schaltet ihn danach fuer die Rangliste frei.
        </p>
      </section>
    );
  }

  if (participantStatus.state === "approved") {
    return (
      <section className="rounded-[2.25rem] border border-emerald-300/15 bg-emerald-400/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100/80">
          Bereit
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">
          {participantStatus.participant.name}, du bist freigegeben
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50/90">
          Dein Eintrag ist beim Team sichtbar. Dein Platz erscheint hier sofort,
          sobald dein Score gespeichert wurde.
        </p>
      </section>
    );
  }

  const { leaderboardEntry, total } = participantStatus;

  return (
    <section className="rounded-[2.25rem] border border-emerald-300/15 bg-emerald-400/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-100/80">
        Dein Platz
      </p>
      <h1 className="mt-3 font-display text-4xl text-white">
        #{leaderboardEntry.rank} fuer {participantStatus.participant.name}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50/90">
        Dein gespeicherter Score liegt bei {leaderboardEntry.score} Punkten. Du
        bist aktuell auf Platz {leaderboardEntry.rank} von {total} in der{" "}
        {participantStatus.participant.gender === "female" ? "Frauen-" : "Maenner-"}
        Rangliste.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-orange-50">
          Trend: {leaderboardEntry.trend === "up" ? "steigend" : leaderboardEntry.trend === "down" ? "unter Druck" : "stabil"}
        </div>
        <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-orange-50">
          Abstand nach hinten: {leaderboardEntry.gapToNext ?? 0}
        </div>
      </div>
    </section>
  );
}
