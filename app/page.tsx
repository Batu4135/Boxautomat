import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { OnboardingForm } from "@/components/onboarding-form";
import { ParticipantStatusCard } from "@/components/participant-status-card";
import { getParticipantSession } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import {
  getLeaderboardParticipants,
  getParticipantPerspectiveLeaderboard,
  getParticipantStatus
} from "@/lib/participants";

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
  const leaderboard = getParticipantPerspectiveLeaderboard(
    await getLeaderboardParticipants(),
    participantStatus
  );

  return (
    <>
      {needsOnboarding ? (
        <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
          <div className="absolute inset-0 bg-slate-950/78 backdrop-blur-md" />
          <div className="relative mx-auto flex min-h-[100dvh] max-w-2xl items-stretch justify-center sm:items-center sm:p-6">
            <OnboardingForm hasError={resolvedSearchParams?.status === "error"} />
          </div>
        </div>
      ) : null}

      <section className={`space-y-6 ${needsOnboarding ? "pointer-events-none select-none blur-[3px]" : ""}`}>
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
              Foto. Erst danach wechselt die App direkt in die Ranglistenansicht.
            </p>
          </section>
        )}

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
