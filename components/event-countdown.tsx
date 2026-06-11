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
      detail: "Top 3 stehen fest",
      remaining: 0
    };
  }, [now]);

  return (
    <div className="flex items-center justify-center gap-3 py-1 text-center text-[11px] uppercase tracking-[0.3em] text-white/50 sm:text-xs">
      <span>{state.label}</span>
      <span className="text-white/25">•</span>
      <span>{state.detail}</span>
      <span className="text-white/25">•</span>
      <span className="font-semibold text-[#ffd166]">{formatInline(state.remaining)}</span>
    </div>
  );
}
