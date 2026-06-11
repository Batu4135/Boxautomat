"use client";

import { useEffect, useMemo, useState } from "react";

type LivePresenceProps = {
  participantCount: number;
};

export function LivePresence({ participantCount }: LivePresenceProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  const onlineCount = useMemo(() => {
    const base = Math.max(8, participantCount + 6);
    const pulse = Math.abs(Math.floor(Math.sin(now / 9000) * 3));
    return base + pulse;
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
    </section>
  );
}
