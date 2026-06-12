"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { OwnedDeleteForm } from "@/components/owned-delete-form";
import type { LeaderboardParticipant } from "@/lib/types";

type LeaderboardTableProps = {
  title: string;
  emptyText: string;
  participants: LeaderboardParticipant[];
  highlightParticipantIds?: string[];
  returnTo: string;
};

function RewardIcon({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-3xl font-black leading-none text-[#ffd166]">1</span>;
  }

  if (rank === 2) {
    return <span className="text-3xl font-black leading-none text-sky-300">2</span>;
  }

  if (rank === 3) {
    return <span className="text-3xl font-black leading-none text-emerald-300">3</span>;
  }

  return <span className="text-sm font-semibold text-white/45">{rank}.</span>;
}

function PencilIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 20h4l10-10-4-4L4 16z" />
      <path d="M13 7l4 4" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="M7 7l1 13h8l1-13" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5" />
      <path d="M6 11l6-6 6 6" />
    </svg>
  );
}

function withQuery(path: string, query: Record<string, string>) {
  const url = new URL(path, "https://boxautomat.local");

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

function rowStyle(rank: number) {
  if (rank === 1) {
    return "border-[#ffd166]/30 bg-[linear-gradient(135deg,rgba(255,209,102,0.16),rgba(255,255,255,0.05))] shadow-[0_18px_40px_rgba(255,209,102,0.08)]";
  }

  if (rank === 2) {
    return "border-sky-300/25 bg-[linear-gradient(135deg,rgba(125,211,252,0.12),rgba(255,255,255,0.05))]";
  }

  if (rank === 3) {
    return "border-emerald-300/25 bg-[linear-gradient(135deg,rgba(110,231,183,0.12),rgba(255,255,255,0.05))]";
  }

  return "border-white/8 bg-white/[0.04]";
}

export function LeaderboardTable({
  title,
  emptyText,
  participants,
  highlightParticipantIds = [],
  returnTo
}: LeaderboardTableProps) {
  const highlightedIds = new Set(highlightParticipantIds);
  const topScore = participants[0]?.score ?? 0;
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [showTopArrow, setShowTopArrow] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      setShowTopArrow(container.scrollTop > 80);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section className="app-panel relative overflow-hidden px-4 py-4 sm:px-5 sm:py-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(255,209,102,0.14),transparent_60%)]" />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Live Board</p>
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
        <div className="relative">
          <div
            ref={scrollRef}
            className="max-h-[30rem] overflow-y-auto pr-1 [scrollbar-color:rgba(255,255,255,0.26)_transparent] [scrollbar-width:thin]"
          >
            <div className="space-y-3">
              {participants.map((participant) => {
                const highlighted = highlightedIds.has(participant.id);
                const scoreWidth =
                  topScore > 0 && participant.score !== null
                    ? Math.max(10, Math.round((participant.score / topScore) * 100))
                    : 10;

                return (
                  <article
                    key={participant.id}
                    id={`leaderboard-entry-${participant.id}`}
                    className={`board-row relative overflow-hidden rounded-[1.55rem] border px-3 py-3.5 ${
                      highlighted
                        ? "border-[#ffd166]/55 bg-[linear-gradient(135deg,rgba(255,209,102,0.22),rgba(255,255,255,0.06))] shadow-[0_0_0_1px_rgba(255,209,102,0.16),0_22px_50px_rgba(255,209,102,0.12)]"
                        : rowStyle(participant.rank)
                    }`}
                  >
                    <div
                      className="pointer-events-none absolute bottom-0 left-0 h-1.5 rounded-r-full bg-[linear-gradient(90deg,#f56442,#ffd166)] opacity-85"
                      style={{ width: `${scoreWidth}%` }}
                    />

                    {highlighted ? (
                      <div className="pointer-events-none absolute inset-y-0 left-0 w-1.5 rounded-r-full bg-[linear-gradient(180deg,#ffd166,#f56442)]" />
                    ) : null}

                    <div className="relative flex items-center gap-3">
                      <div className="flex h-12 w-14 shrink-0 items-center justify-center rounded-[1rem] border border-white/10 bg-black/18">
                        <RewardIcon rank={participant.rank} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-white sm:text-base">
                          {participant.name}
                        </p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/42">
                          Platz {participant.rank}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/35">Punkte</p>
                        <p className="mt-1 text-xl font-semibold text-white sm:text-2xl">
                          {participant.score}
                        </p>
                      </div>

                      {highlighted ? (
                        <div className="flex shrink-0 gap-2">
                          <Link
                            href={withQuery(returnTo, { submit: "1", edit: participant.id })}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 transition hover:bg-white/12"
                            aria-label="Eintrag bearbeiten"
                          >
                            <PencilIcon />
                          </Link>
                          <OwnedDeleteForm id={participant.id} returnTo={returnTo}>
                            <TrashIcon />
                          </OwnedDeleteForm>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {showTopArrow ? (
            <button
              type="button"
              className="absolute bottom-3 right-3 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-[#07111e]/88 text-white shadow-[0_14px_30px_rgba(2,8,23,0.45)] backdrop-blur transition hover:bg-[#0b1728]"
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })}
              aria-label="Nach oben"
            >
              <ArrowUpIcon />
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}
