import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LivePresence } from "@/components/live-presence";
import { OnboardingForm } from "@/components/onboarding-form";
import { ScoreEntryButton } from "@/components/score-entry-button";
import { getOwnedParticipantIds } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import {
  getLeaderboardParticipants,
  getParticipantById,
  getParticipantsByIds,
  getParticipantSummary
} from "@/lib/participants";

export const revalidate = 0;

type LeaderboardPageProps = {
  searchParams?: Promise<{
    status?: string;
    submit?: string;
    edit?: string;
  }>;
};

export default async function LeaderboardPage({ searchParams }: LeaderboardPageProps) {
  const resolvedSearchParams = await searchParams;

  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const ownedParticipantIds = await getOwnedParticipantIds();
  const ownedParticipants = await getParticipantsByIds(ownedParticipantIds);
  const leaderboard = await getLeaderboardParticipants();
  const summary = await getParticipantSummary();
  const editParticipantId = resolvedSearchParams?.edit ?? null;
  const editParticipant =
    editParticipantId && ownedParticipantIds.includes(editParticipantId)
      ? await getParticipantById(editParticipantId)
      : null;
  const showSubmitFlow =
    resolvedSearchParams?.submit === "1" || resolvedSearchParams?.status === "error";
  const ownedHighlights = ownedParticipants.map((participant) => participant.id);

  return (
    <>
      {showSubmitFlow ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(10,22,37,1))]">
          <div className="mx-auto flex h-full max-w-2xl items-stretch justify-center sm:p-6">
            <OnboardingForm
              hasError={resolvedSearchParams?.status === "error"}
              closeHref="/rangliste"
              returnTo="/rangliste"
              defaultName={editParticipant?.name ?? ""}
              defaultGender={editParticipant?.gender ?? ""}
              defaultScore={editParticipant?.score ?? undefined}
              editParticipantId={editParticipant?.id ?? undefined}
              hasExistingPhoto={Boolean(editParticipant?.photo_content_type)}
            />
          </div>
        </div>
      ) : null}

      <section className="space-y-5 pb-24">
        <LivePresence participantCount={summary.participantCount} />

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderboardTable
            title="Damen"
            participants={leaderboard.female}
            emptyText="Noch keine Scores in der Damen-Rangliste."
            highlightParticipantIds={ownedHighlights}
            returnTo="/rangliste"
          />
          <LeaderboardTable
            title="Männer"
            participants={leaderboard.male}
            emptyText="Noch keine Scores in der Männer-Rangliste."
            highlightParticipantIds={ownedHighlights}
            returnTo="/rangliste"
          />
        </div>
      </section>

      <ScoreEntryButton href="/rangliste?submit=1" />
    </>
  );
}
