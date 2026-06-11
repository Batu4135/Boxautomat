import type { LeaderboardParticipant } from "@/lib/types";

type LiveTickerProps = {
  participants: LeaderboardParticipant[];
};

function TickerPill({ participant }: { participant: LeaderboardParticipant }) {
  const tone =
    participant.trend === "up"
      ? "bg-emerald-300"
      : participant.trend === "down"
        ? "bg-rose-300"
        : "bg-amber-200";

  return (
    <div className="inline-flex min-w-max items-center gap-3 rounded-full border border-white/10 bg-white/8 px-4 py-2 text-sm text-white shadow-[0_12px_30px_rgba(2,8,23,0.25)]">
      <span className={`h-2.5 w-2.5 rounded-full ${tone}`} />
      <span className="font-semibold">#{participant.rank}</span>
      <span>{participant.name}</span>
      <span className="rounded-full bg-black/20 px-2 py-1 text-xs text-white/75">
        {participant.score}
      </span>
    </div>
  );
}

export function LiveTicker({ participants }: LiveTickerProps) {
  if (participants.length === 0) {
    return null;
  }

  const tickerEntries = [...participants, ...participants];

  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Momentum</p>
          <h2 className="mt-2 font-display text-xl text-white">Live Ticker</h2>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-emerald-100">
          <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.9)]" />
          Live
        </div>
      </div>

      <div className="ticker-mask">
        <div className="ticker-track">
          {tickerEntries.map((participant, index) => (
            <TickerPill key={`${participant.id}-${index}`} participant={participant} />
          ))}
        </div>
      </div>
    </section>
  );
}
