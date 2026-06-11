import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LiveTicker } from "@/components/live-ticker";
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

  if (needsOnboarding) {
    return (
      <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.18),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(15,23,42,1))]">
        <div className="mx-auto flex h-full max-w-2xl items-stretch justify-center sm:p-6">
          <OnboardingForm hasError={resolvedSearchParams?.status === "error"} />
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <ParticipantStatusCard participantStatus={participantStatus} />
      <LiveTicker participants={leaderboard.all.slice(0, 8)} />

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <LeaderboardTable
          title="Frauen"
          participants={leaderboard.female}
          emptyText="Noch keine freigegebenen Scores in der Frauen-Rangliste."
          highlightParticipantId={
            participantStatus.participant.gender === "female"
              ? participantStatus.participant.id
              : undefined
          }
        />
        <LeaderboardTable
          title="Maenner"
          participants={leaderboard.male}
          emptyText="Noch keine freigegebenen Scores in der Maenner-Rangliste."
          highlightParticipantId={
            participantStatus.participant.gender === "male"
              ? participantStatus.participant.id
              : undefined
          }
        />
      </div>
    </section>
  );
}
