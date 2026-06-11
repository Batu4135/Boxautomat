import type { LeaderboardParticipant } from "@/lib/types";

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
  highlightParticipantIds?: string[];
};

function RewardIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-2xl opacity-45">🏆</span>;
  }

  if (rank === 2) {
    return <span className="text-2xl opacity-55">🍽️🥤</span>;
  }

  if (rank === 3) {
    return <span className="text-2xl opacity-55">🍰🥤</span>;
  }

  return <span className="text-sm font-semibold text-white/45">{rank}.</span>;
}

function rowStyle(rank: number) {
  if (rank === 1) {
    return "border-[#ffd166]/30 bg-[linear-gradient(135deg,rgba(255,209,102,0.14),rgba(255,255,255,0.04))]";
  }

  if (rank === 2) {
    return "border-cyan-300/25 bg-[linear-gradient(135deg,rgba(125,211,252,0.12),rgba(255,255,255,0.04))]";
  }

  if (rank === 3) {
    return "border-emerald-300/25 bg-[linear-gradient(135deg,rgba(110,231,183,0.12),rgba(255,255,255,0.04))]";
  }

  return "border-white/8 bg-white/[0.035]";
}

export function LeaderboardTable({
  title,
  emptyText,
  participants,
  highlightParticipantIds = []
}: LeaderboardTableProps) {
  const highlightedIds = new Set(highlightParticipantIds);

  return (
    <section className="app-panel overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Board</p>
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
        <div className="space-y-2.5">
          {participants.map((participant) => {
            const highlighted = highlightedIds.has(participant.id);

            return (
              <article
                key={participant.id}
                className={`board-row flex items-center gap-3 rounded-[1.45rem] border px-3 py-3.5 ${
                  highlighted
                    ? "border-[#ffd166]/35 bg-[linear-gradient(135deg,rgba(255,209,102,0.16),rgba(255,255,255,0.05))]"
                    : rowStyle(participant.rank)
                }`}
              >
                <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-black/18">
                  <RewardIcon rank={participant.rank} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white sm:text-base">
                      {participant.name}
                    </p>
                    {highlighted ? (
                      <span className="rounded-full border border-[#ffd166]/30 bg-[#ffd166]/12 px-2 py-0.5 text-[10px] uppercase tracking-[0.22em] text-[#ffe4a4]">
                        Von dir erstellt
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/38">
                    Platz {participant.rank}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Punkte</p>
                  <p className="mt-1 text-lg font-semibold text-white sm:text-xl">
                    {participant.score}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
