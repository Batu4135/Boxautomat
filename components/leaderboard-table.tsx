import type { LeaderboardParticipant } from "@/lib/types";

const BOARD_LIMIT = 6;

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
  highlightParticipantId?: string;
};

function TrendSignal({ trend }: { trend: LeaderboardParticipant["trend"] }) {
  const trendClass =
    trend === "up"
      ? "bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]"
      : trend === "down"
        ? "bg-rose-300 shadow-[0_0_16px_rgba(252,165,165,0.7)]"
        : "bg-amber-200 shadow-[0_0_16px_rgba(253,230,138,0.7)]";

  return <span className={`h-2.5 w-2.5 rounded-full ${trendClass}`} />;
}

function RankTone({ index }: { index: number }) {
  if (index === 0) {
    return "border-orange-300/25 bg-orange-300/12";
  }

  if (index === 1) {
    return "border-cyan-300/20 bg-cyan-300/10";
  }

  if (index === 2) {
    return "border-emerald-300/20 bg-emerald-300/10";
  }

  return "border-white/8 bg-white/[0.04]";
}

export function LeaderboardTable({
  title,
  emptyText,
  participants,
  highlightParticipantId
}: LeaderboardTableProps) {
  const topParticipants = participants.slice(0, BOARD_LIMIT);
  const rows = Array.from({ length: BOARD_LIMIT }, (_, index) => topParticipants[index] ?? null);

  return (
    <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(10,18,33,0.92),rgba(8,14,25,0.84))] p-4 shadow-[0_24px_70px_rgba(2,8,23,0.28)] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Top 6</p>
          <h2 className="mt-2 font-display text-xl text-white sm:text-2xl">{title}</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.25em] text-white/70">
          {participants.length}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((participant, index) => {
          if (!participant) {
            return (
              <div
                key={`placeholder-${title}-${index}`}
                className="flex items-center gap-3 rounded-[1.3rem] border border-dashed border-white/8 bg-white/[0.03] px-3 py-3.5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/20 text-sm font-semibold text-white/45">
                  #{index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/35">Freier Platz</p>
                </div>
                <p className="text-sm font-semibold text-white/30">---</p>
              </div>
            );
          }

          const isHighlighted = participant.id === highlightParticipantId;

          return (
            <article
              key={participant.id}
              className={`board-row flex items-center gap-3 rounded-[1.3rem] border px-3 py-3.5 ${
                isHighlighted
                  ? "border-orange-300/35 bg-orange-300/14"
                  : RankTone({ index })
              }`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/25 text-sm font-semibold text-white">
                #{index + 1}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-white sm:text-[15px]">
                    {participant.name}
                  </p>
                  {isHighlighted ? (
                    <span className="rounded-full border border-orange-200/25 bg-orange-200/14 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-orange-100">
                      Du
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-white/45">
                  <TrendSignal trend={participant.trend} />
                  <span>{participant.trend === "up" ? "steigt" : participant.trend === "down" ? "faellt" : "stabil"}</span>
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

      {participants.length === 0 ? (
        <p className="mt-4 rounded-[1.25rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white/50">
          {emptyText}
        </p>
      ) : null}
    </section>
  );
}
