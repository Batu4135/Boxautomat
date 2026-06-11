import type { LeaderboardParticipant } from "@/lib/types";

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
  highlightParticipantId?: string;
};

function placementStyle(rank: number) {
  if (rank === 1) {
    return "border-yellow-300/25 bg-yellow-300/10";
  }

  if (rank === 2) {
    return "border-sky-300/25 bg-sky-300/10";
  }

  if (rank === 3) {
    return "border-emerald-300/25 bg-emerald-300/10";
  }

  return "border-white/8 bg-white/[0.04]";
}

function placementLabel(rank: number) {
  if (rank === 1) {
    return "1.";
  }

  if (rank === 2) {
    return "2.";
  }

  if (rank === 3) {
    return "3.";
  }

  return `${rank}.`;
}

export function LeaderboardTable({
  title,
  emptyText,
  participants,
  highlightParticipantId
}: LeaderboardTableProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,31,0.92),rgba(8,14,25,0.84))] p-4 shadow-[0_24px_60px_rgba(2,8,23,0.24)] backdrop-blur sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Board</p>
          <h2 className="mt-2 font-display text-2xl text-white">{title}</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/65">
          {participants.length}
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-[1.3rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-8 text-sm text-white/50">
          {emptyText}
        </div>
      ) : (
        <div className="space-y-2.5">
          {participants.map((participant) => {
            const highlighted = participant.id === highlightParticipantId;

            return (
              <article
                key={participant.id}
                className={`board-row flex items-center gap-3 rounded-[1.3rem] border px-3 py-3 ${
                  highlighted
                    ? "border-orange-300/35 bg-orange-300/12"
                    : placementStyle(participant.rank)
                }`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-white">
                  {placementLabel(participant.rank)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white sm:text-base">
                      {participant.name}
                    </p>
                    {highlighted ? (
                      <span className="rounded-full border border-orange-200/25 bg-orange-200/14 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-orange-100">
                        Du
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Punkte</p>
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
