import type { LeaderboardParticipant } from "@/lib/types";

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
};

function TrendBadge({
  trend,
  gapToNext
}: {
  trend: LeaderboardParticipant["trend"];
  gapToNext: number | null;
}) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-200">
        <span className="trend-arrow trend-up">▲</span>
        +{gapToNext ?? 0}
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-semibold text-rose-200">
        <span className="trend-arrow trend-down">▼</span>
        Druck
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-semibold text-amber-100">
      <span className="trend-arrow trend-steady">●</span>
      Stabil
    </span>
  );
}

export function LeaderboardTable({
  title,
  emptyText,
  participants
}: LeaderboardTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.25)] backdrop-blur">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
            Rangliste
          </p>
          <h2 className="font-display text-2xl text-white">{title}</h2>
        </div>
        <div className="rounded-full border border-white/15 bg-black/10 px-4 py-2 text-sm text-orange-50">
          {participants.length} Eintraege
        </div>
      </div>

      {participants.length === 0 ? (
        <p className="rounded-2xl bg-black/15 px-4 py-6 text-sm text-orange-50/85">
          {emptyText}
        </p>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/10">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-black/20 text-orange-100">
              <tr>
                <th className="px-4 py-3 font-medium">Platz</th>
                <th className="px-4 py-3 font-medium">Signal</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 text-right font-medium">Punkte</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((participant, index) => (
                <tr
                  key={participant.id}
                  className="border-t border-white/10 bg-white/5 text-orange-50 transition hover:bg-white/8"
                >
                  <td className="px-4 py-3 font-semibold">#{index + 1}</td>
                  <td className="px-4 py-3">
                    <TrendBadge trend={participant.trend} gapToNext={participant.gapToNext} />
                  </td>
                  <td className="px-4 py-3">{participant.name}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {participant.score}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
