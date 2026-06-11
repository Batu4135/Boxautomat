import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LiveTicker } from "@/components/live-ticker";
import { OnboardingForm } from "@/components/onboarding-form";
import { ScoreEntryButton } from "@/components/score-entry-button";
import { getParticipantSession } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import {
  getLeaderboardParticipants,
  getParticipantPerspectiveLeaderboard,
  getParticipantStatus
} from "@/lib/participants";

export const revalidate = 0;

type LeaderboardPageProps = {
  searchParams?: Promise<{
    status?: string;
    submit?: string;
  }>;
};

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;

  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const participantSession = await getParticipantSession();
  const participantStatus = participantSession
    ? await getParticipantStatus(participantSession)
    : null;
  const leaderboard = getParticipantPerspectiveLeaderboard(
    await getLeaderboardParticipants(),
    participantStatus
  );
  const showSubmitFlow =
    resolvedSearchParams?.submit === "1" || resolvedSearchParams?.status === "error";

  return (
    <>
      {showSubmitFlow ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,1))]">
          <div className="mx-auto flex h-full max-w-2xl items-stretch justify-center sm:p-6">
            <OnboardingForm
              hasError={resolvedSearchParams?.status === "error"}
              closeHref="/rangliste"
              returnTo="/rangliste"
              defaultName={participantStatus?.participant.name}
              defaultGender={participantStatus?.participant.gender ?? ""}
            />
          </div>
        </div>
      ) : null}

      <section className="space-y-5 pb-24">
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
                Nur freigegebene Scores. Neue Versuche lassen sich direkt wieder hochladen.
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
            highlightParticipantId={
              participantStatus?.participant.gender === "female"
                ? participantStatus.participant.id
                : undefined
            }
          />
          <LeaderboardTable
            title="Maenner"
            participants={leaderboard.male}
            emptyText="Noch keine freigegebenen Scores in der Maenner-Rangliste."
            highlightParticipantId={
              participantStatus?.participant.gender === "male"
                ? participantStatus.participant.id
                : undefined
            }
          />
        </div>
      </section>

      <ScoreEntryButton href="/rangliste?submit=1" />
    </>
  );
}
