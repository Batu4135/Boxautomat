import type { LeaderboardParticipant } from "@/lib/types";

type LiveTickerProps = {
  participants: LeaderboardParticipant[];
};

function TickerPill({ participant }: { participant: LeaderboardParticipant }) {
  const trendClass =
    participant.trend === "up"
      ? "text-emerald-300"
      : participant.trend === "down"
        ? "text-rose-300"
        : "text-amber-200";
  const trendIcon = participant.trend === "up" ? "▲" : participant.trend === "down" ? "▼" : "●";

  return (
    <div className="inline-flex min-w-max items-center gap-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-orange-50 shadow-[0_10px_30px_rgba(2,6,23,0.28)]">
      <span className={`trend-arrow ${trendClass}`}>{trendIcon}</span>
      <span className="font-semibold">#{participant.rank}</span>
      <span>{participant.name}</span>
      <span className="rounded-full bg-white/8 px-2 py-1 text-xs">
        {participant.score} pts
      </span>
    </div>
  );
}

export function LiveTicker({ participants }: LiveTickerProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-sm text-orange-50/80 backdrop-blur">
        Sobald die ersten Scores gespeichert sind, laeuft hier das Live-Board.
      </div>
    );
  }

  const tickerEntries = [...participants, ...participants];

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
            Live Board
          </p>
          <h2 className="font-display text-2xl text-white">Ticker</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-orange-100/80">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
          LIVE
        </div>
      </div>

      <div className="ticker-mask">
        <div className="ticker-track">
          {tickerEntries.map((participant, index) => (
            <TickerPill key={`${participant.id}-${index}`} participant={participant} />
          ))}
        </div>
      </div>
    </div>
  );
}
