"use client";

import { useEffect, useMemo, useState } from "react";

const EVENT_START = "2026-06-12T12:00:00+02:00";
const EVENT_END = "2026-06-14T16:00:00+02:00";

function formatInline(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${days}T ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
}

export function EventCountdown() {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const state = useMemo(() => {
    const start = new Date(EVENT_START).getTime();
    const end = new Date(EVENT_END).getTime();

    if (now < start) {
      return {
        label: "Startet",
        detail: "Fr 12:00",
        remaining: start - now
      };
    }

    if (now <= end) {
      return {
        label: "Läuft bis",
        detail: "So 16:00",
        remaining: end - now
      };
    }

    return {
      label: "Wertung geschlossen",
      detail: "Auswertung läuft",
      remaining: 0
    };
  }, [now]);

  return (
    <div className="flex items-center justify-center gap-3 rounded-full border border-rose-400/25 bg-[linear-gradient(135deg,rgba(127,29,29,0.72),rgba(239,68,68,0.16))] px-4 py-2 text-center text-[11px] uppercase tracking-[0.28em] text-rose-100 shadow-[0_12px_30px_rgba(127,29,29,0.22)] sm:text-xs">
      <span className="font-semibold text-rose-200">{state.label}</span>
      <span className="text-rose-200/35">•</span>
      <span>{state.detail}</span>
      <span className="text-rose-200/35">•</span>
      <span className="font-semibold text-[#ff8b8b]">{formatInline(state.remaining)}</span>
    </div>
  );
}
