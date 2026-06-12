"use client";

import { useEffect, useMemo, useState } from "react";

type LivePresenceProps = {
  participantCount: number;
  bestRank: number | null;
  bestLabel: string | null;
  bestEntryId?: string | null;
};

export function LivePresence({
  participantCount,
  bestRank,
  bestLabel,
  bestEntryId = null
}: LivePresenceProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const onlineCount = useMemo(() => {
    const span = 7;
    const wave = Math.round(((Math.sin(now / 9000) + 1) / 2) * span);
    const nudged = 18 + wave + (participantCount % 2);
    return Math.min(24, Math.max(18, nudged));
  }, [now, participantCount]);

  return (
    <section className="app-panel flex flex-col items-center gap-4 px-4 py-5 text-center sm:px-6">
      <div>
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">
          Selimiye Moschee Sommerfest
        </p>
        <h1 className="mt-2 font-display text-[2rem] leading-none text-white sm:text-[2.8rem]">
          Box-Automat Challenge
        </h1>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-100">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.95)]" />
          Aktuell online {onlineCount}
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/85">
          Teilnehmerzahl {participantCount}
        </div>
      </div>

      {bestRank ? (
        <button
          type="button"
          className="w-full rounded-[1.75rem] border border-[#ffd166]/18 bg-[linear-gradient(135deg,rgba(255,209,102,0.16),rgba(255,255,255,0.03))] px-5 py-5 text-left shadow-[0_16px_40px_rgba(255,209,102,0.08)] transition hover:translate-y-[-1px]"
          onClick={() => {
            if (!bestEntryId) {
              return;
            }

            window.dispatchEvent(
              new CustomEvent("jump-to-entry", {
                detail: { id: bestEntryId }
              })
            );
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.34em] text-[#ffe4a4]/70">
            Dein bester Rang
          </p>
          <p className="mt-2 font-display text-4xl leading-none text-[#fff1c7] sm:text-5xl">
            Platz #{bestRank}
          </p>
          {bestLabel ? (
            <p className="mt-3 text-sm font-medium text-[#ffe4a4]/88 sm:text-base">{bestLabel}</p>
          ) : null}
        </button>
      ) : null}
    </section>
  );
}
