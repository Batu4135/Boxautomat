"use client";

import { useEffect, useMemo, useState } from "react";

const EVENT_START = "2026-06-12T12:00:00+02:00";
const EVENT_END = "2026-06-14T17:00:00+02:00";

function formatTimeParts(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds };
}

function CountdownUnit({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[1.15rem] border border-white/10 bg-white/[0.05] px-3 py-3 text-center">
      <div className="font-display text-2xl text-white sm:text-3xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-[0.3em] text-white/45">
        {label}
      </div>
    </div>
  );
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
        label: "Startet in",
        description: "Freitag, 12. Juni 2026, 12:00 Uhr",
        remaining: start - now
      };
    }

    if (now <= end) {
      return {
        label: "Läuft bis",
        description: "Sonntag, 14. Juni 2026, 17:00 Uhr",
        remaining: end - now
      };
    }

    return {
      label: "Wertung geschlossen",
      description: "Top 3 Frauen und Top 3 Männer stehen fest.",
      remaining: 0
    };
  }, [now]);

  const time = formatTimeParts(state.remaining);

  return (
    <section className="rounded-[1.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(8,18,31,0.9),rgba(8,14,25,0.82))] p-4 shadow-[0_20px_55px_rgba(2,8,23,0.22)] backdrop-blur sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Countdown</p>
          <h2 className="mt-2 font-display text-2xl text-white">{state.label}</h2>
          <p className="mt-2 text-sm text-slate-300">{state.description}</p>
        </div>

        <div className="grid grid-cols-4 gap-2 sm:min-w-[20rem]">
          <CountdownUnit label="Tage" value={time.days} />
          <CountdownUnit label="Std" value={time.hours} />
          <CountdownUnit label="Min" value={time.minutes} />
          <CountdownUnit label="Sek" value={time.seconds} />
        </div>
      </div>
    </section>
  );
}
