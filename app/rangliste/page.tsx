import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LivePresence } from "@/components/live-presence";
import { OnboardingForm } from "@/components/onboarding-form";
import { OwnedEntriesPanel } from "@/components/owned-entries-panel";
import { ScoreEntryButton } from "@/components/score-entry-button";
import { getOwnedParticipantIds, getParticipantSession } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import {
  getParticipantById,
  getLeaderboardParticipants,
  getParticipantsByIds,
  getParticipantPerspectiveLeaderboard,
  getParticipantStatus,
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

  const participantSession = await getParticipantSession();
  const ownedParticipantIds = await getOwnedParticipantIds();
  const participantStatus = participantSession
    ? await getParticipantStatus(participantSession)
    : null;
  const ownedParticipants = await getParticipantsByIds(ownedParticipantIds);
  const ownedStatuses = (
    await Promise.all(ownedParticipants.map((participant) => getParticipantStatus(participant.id)))
  ).filter((status) => status !== null);
  const leaderboard = getParticipantPerspectiveLeaderboard(
    await getLeaderboardParticipants(),
    participantStatus
  );
  const summary = await getParticipantSummary();
  const editParticipantId = resolvedSearchParams?.edit ?? null;
  const editParticipant =
    editParticipantId && ownedParticipantIds.includes(editParticipantId)
      ? await getParticipantById(editParticipantId)
      : null;
  const showSubmitFlow =
    resolvedSearchParams?.submit === "1" || resolvedSearchParams?.status === "error";
  const ownedHighlights = ownedParticipants.map((participant) => participant.id);
  const bestOwnedEntry = leaderboard.all.find((entry) => ownedHighlights.includes(entry.id)) ?? null;

  return (
    <>
      {showSubmitFlow ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(10,22,37,1))]">
          <div className="mx-auto flex h-full max-w-2xl items-stretch justify-center sm:p-6">
            <OnboardingForm
              hasError={resolvedSearchParams?.status === "error"}
              closeHref="/rangliste"
              returnTo="/rangliste"
              defaultName={editParticipant?.name ?? participantStatus?.participant.name}
              defaultGender={editParticipant?.gender ?? participantStatus?.participant.gender ?? ""}
              defaultScore={editParticipant?.score ?? undefined}
              editParticipantId={editParticipant?.id ?? undefined}
              hasExistingPhoto={Boolean(editParticipant?.photo_content_type)}
            />
          </div>
        </div>
      ) : null}

      <section className="space-y-5 pb-24">
        <LivePresence
          participantCount={summary.participantCount}
          bestRank={bestOwnedEntry?.rank ?? null}
          bestLabel={bestOwnedEntry?.name ?? null}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderboardTable
            title="Frauen"
            participants={leaderboard.female}
            emptyText="Noch keine freigegebenen Scores in der Frauen-Rangliste."
            highlightParticipantIds={ownedHighlights}
          />
          <LeaderboardTable
            title="Männer"
            participants={leaderboard.male}
            emptyText="Noch keine freigegebenen Scores in der Männer-Rangliste."
            highlightParticipantIds={ownedHighlights}
          />
        </div>

        <OwnedEntriesPanel entries={ownedParticipants} statuses={ownedStatuses} returnTo="/rangliste" />
      </section>

      <ScoreEntryButton href="/rangliste?submit=1" />
    </>
  );
}
