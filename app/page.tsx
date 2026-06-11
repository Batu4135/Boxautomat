import Link from "next/link";

import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LiveTicker } from "@/components/live-ticker";
import { OnboardingForm } from "@/components/onboarding-form";
import { ParticipantStatusCard } from "@/components/participant-status-card";
import { getParticipantSession } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import { getLeaderboardParticipants, getParticipantStatus } from "@/lib/participants";

type HomePageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

export const revalidate = 0;

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const participantSession = await getParticipantSession();
  const participantStatus = participantSession
    ? await getParticipantStatus(participantSession)
    : null;
  const needsOnboarding = !participantStatus;
  const leaderboard = await getLeaderboardParticipants();
  const liveEntries = leaderboard.all.slice(0, 8);

  return (
    <>
      {needsOnboarding ? (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-950/78 backdrop-blur-md" />
          <div className="relative mx-auto flex min-h-screen max-w-2xl items-center justify-center p-4 sm:p-6">
            <OnboardingForm hasError={resolvedSearchParams?.status === "error"} />
          </div>
        </div>
      ) : null}

      <section className={`space-y-6 ${needsOnboarding ? "pointer-events-none select-none blur-[3px]" : ""}`}>
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr] xl:items-start">
        <div className="space-y-6">
          {participantStatus ? (
            <ParticipantStatusCard participantStatus={participantStatus} />
          ) : (
            <section className="rounded-[2.5rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-200/80">
                Scan erkannt
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                Dein Onboarding ist gerade geoeffnet
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50/85 sm:text-lg">
                Beim ersten Besuch erscheint ein Pflichtfenster fuer Name, Punktzahl und
                Foto. Erst danach wechselt die App in die normale Ranglistenansicht.
              </p>
            </section>
          )}

          <section className="rounded-[2rem] border border-white/10 bg-black/20 p-6 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-200/80">
                  Ablauf
                </p>
                <h2 className="mt-2 font-display text-2xl text-white">
                  Vom Eintrag bis zum Platz
                </h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">01</p>
                <p className="mt-2 text-sm leading-6 text-orange-50/85">
                  Beim ersten QR-Scan gibst du deinen Namen und dein Geschlecht ein.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">02</p>
                <p className="mt-2 text-sm leading-6 text-orange-50/85">
                  Direkt nach dem Schlag traegst du die Punktzahl ein und machst ein Foto vom Display.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-orange-200/70">03</p>
                <p className="mt-2 text-sm leading-6 text-orange-50/85">
                  Das Team prueft Foto und Wert. Danach erscheint dein Platz in der Rangliste.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <LiveTicker participants={liveEntries} />

          <section className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                  Direkt sichtbar
                </p>
                <h2 className="mt-2 font-display text-2xl text-white">Top Scores</h2>
              </div>
              <Link href="/rangliste" className="text-sm text-orange-100/85 underline-offset-4 hover:underline">
                Ganze Rangliste
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {leaderboard.all.length === 0 ? (
                <div className="rounded-[1.6rem] border border-white/10 bg-black/20 p-4 text-sm text-orange-50/80 sm:col-span-3">
                  Noch keine Scores gespeichert. Die ersten Treffer erscheinen hier sofort.
                </div>
              ) : null}

              {leaderboard.all.slice(0, 3).map((participant) => (
                <div
                  key={participant.id}
                  className="relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/20 p-4"
                >
                  <div
                    className={`signal-glow ${
                      participant.trend === "up"
                        ? "bg-emerald-400/30"
                        : participant.trend === "down"
                          ? "bg-rose-400/20"
                          : "bg-amber-300/20"
                    }`}
                  />
                  <p className="relative z-10 text-xs uppercase tracking-[0.3em] text-orange-200/70">
                    Platz {participant.rank}
                  </p>
                  <h3 className="relative z-10 mt-2 font-display text-xl text-white">
                    {participant.name}
                  </h3>
                  <p className="relative z-10 mt-3 text-2xl font-semibold text-orange-50">
                    {participant.score}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <LeaderboardTable
          title="Frauen-Rangliste"
          participants={leaderboard.female}
          emptyText="Noch keine freigegebenen Scores in der Frauen-Rangliste."
        />
        <LeaderboardTable
          title="Maenner-Rangliste"
          participants={leaderboard.male}
          emptyText="Noch keine freigegebenen Scores in der Maenner-Rangliste."
        />
      </div>
      </section>
    </>
  );
}
