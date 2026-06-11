import type { LeaderboardParticipant } from "@/lib/types";

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
  highlightParticipantIds?: string[];
};

function RewardIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-3xl font-black leading-none text-[#ffd166]">1</span>;
  }

  if (rank === 2) {
    return <span className="text-3xl font-black leading-none text-sky-300">2</span>;
  }

  if (rank === 3) {
    return <span className="text-3xl font-black leading-none text-emerald-300">3</span>;
  }

  return <span className="text-sm font-semibold text-white/45">{rank}.</span>;
}

function rowStyle(rank: number) {
  if (rank === 1) {
    return "border-[#ffd166]/30 bg-[linear-gradient(135deg,rgba(255,209,102,0.16),rgba(255,255,255,0.05))] shadow-[0_18px_40px_rgba(255,209,102,0.08)]";
  }

  if (rank === 2) {
    return "border-sky-300/25 bg-[linear-gradient(135deg,rgba(125,211,252,0.12),rgba(255,255,255,0.05))]";
  }

  if (rank === 3) {
    return "border-emerald-300/25 bg-[linear-gradient(135deg,rgba(110,231,183,0.12),rgba(255,255,255,0.05))]";
  }

  return "border-white/8 bg-white/[0.04]";
}

export function LeaderboardTable({
  title,
  emptyText,
  participants,
  highlightParticipantIds = []
}: LeaderboardTableProps) {
  const highlightedIds = new Set(highlightParticipantIds);
  const topScore = participants[0]?.score ?? 0;

  return (
    <section className="app-panel relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,209,102,0.14),transparent_60%)]" />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Live Board</p>
          <h2 className="mt-2 font-display text-2xl text-white">{title}</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/65">
          {participants.length}
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-[1.4rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/50">
          {emptyText}
        </div>
      ) : (
        <div className="max-h-[30rem] overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.26)_transparent] [scrollbar-width:thin]">
          <div className="space-y-3">
            {participants.map((participant) => {
              const highlighted = highlightedIds.has(participant.id);
              const scoreWidth =
                topScore > 0 && participant.score !== null
                  ? Math.max(10, Math.round((participant.score / topScore) * 100))
                  : 10;

              return (
                <article
                  key={participant.id}
                  className={`board-row relative overflow-hidden rounded-[1.55rem] border px-3 py-3.5 ${
                    highlighted
                      ? "border-[#ffd166]/35 bg-[linear-gradient(135deg,rgba(255,209,102,0.18),rgba(255,255,255,0.05))] shadow-[0_18px_40px_rgba(255,209,102,0.08)]"
                      : rowStyle(participant.rank)
                  }`}
                >
                  <div
                    className="pointer-events-none absolute bottom-0 left-0 h-1.5 rounded-r-full bg-[linear-gradient(90deg,#f56442,#ffd166)] opacity-85"
                    style={{ width: `${scoreWidth}%` }}
                  />

                  <div className="relative flex items-center gap-3">
                    <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-black/18">
                      <RewardIcon rank={participant.rank} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-white sm:text-base">
                          {participant.name}
                        </p>
                        {highlighted ? (
                          <span className="shrink-0 rounded-full border border-[#ffd166]/30 bg-[#ffd166]/12 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#ffe4a4]">
                            Dein
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/42">
                        Platz {participant.rank}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">
                        Punkte
                      </p>
                      <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                        {participant.score}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
