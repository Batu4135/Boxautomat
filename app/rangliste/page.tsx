import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LiveTicker } from "@/components/live-ticker";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import { getLeaderboardParticipants } from "@/lib/participants";

export const revalidate = 0;

export default async function LeaderboardPage() {
  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const leaderboard = await getLeaderboardParticipants();

  return (
    <section className="space-y-5">
      <section className="hero-shell relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(7,18,35,0.9),rgba(11,31,54,0.82))] p-5 shadow-[0_30px_90px_rgba(2,8,23,0.35)] sm:rounded-[2.5rem] sm:p-7">
        <div className="hero-noise" aria-hidden="true" />
        <div className="hero-beam" aria-hidden="true" />

        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.95)]" />
              Public Board
            </div>
            <p className="mt-5 text-sm uppercase tracking-[0.35em] text-white/45">
              Selimiye Bremen
            </p>
            <h1 className="mt-3 font-display text-[2.4rem] leading-none text-white sm:text-[3.6rem]">
              Rangliste
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Nur freigegebene Scores. Pro Person zaehlt der hoechste Wert.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">Frauen</p>
              <p className="mt-2 font-display text-xl text-white sm:text-2xl">
                {leaderboard.female.length}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">Maenner</p>
              <p className="mt-2 font-display text-xl text-white sm:text-2xl">
                {leaderboard.male.length}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">Gesamt</p>
              <p className="mt-2 font-display text-xl text-white sm:text-2xl">
                {leaderboard.all.length}
              </p>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/8 p-4">
              <p className="text-[11px] uppercase tracking-[0.3em] text-white/55">Ansicht</p>
              <p className="mt-2 font-display text-xl text-white sm:text-2xl">Top 6</p>
            </div>
          </div>
        </div>
      </section>

      <LiveTicker participants={leaderboard.all.slice(0, 8)} />

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <LeaderboardTable
          title="Frauen"
          participants={leaderboard.female}
          emptyText="Noch keine freigegebenen Scores in der Frauen-Rangliste."
        />
        <LeaderboardTable
          title="Maenner"
          participants={leaderboard.male}
          emptyText="Noch keine freigegebenen Scores in der Maenner-Rangliste."
        />
      </div>
    </section>
  );
}
