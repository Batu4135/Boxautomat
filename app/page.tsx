import { AccountPanel } from "@/components/account-panel";
import { EnvSetupCard } from "@/components/env-setup-card";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { LivePresence } from "@/components/live-presence";
import { OnboardingForm } from "@/components/onboarding-form";
import { ScoreEntryButton } from "@/components/score-entry-button";
import { getAccountById } from "@/lib/accounts";
import { getUserSession } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import {
  getLeaderboardParticipants,
  getParticipantById,
  getParticipantPerspectiveLeaderboard,
  getParticipantsByAccountId,
  getParticipantStatus,
  getParticipantSummary
} from "@/lib/participants";

type HomePageProps = {
  searchParams?: Promise<{
    status?: string;
    submit?: string;
    view?: string;
    edit?: string;
    auth?: string;
    authError?: string;
  }>;
};

export const revalidate = 0;

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = await searchParams;

  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const accountId = await getUserSession();
  const account = accountId ? await getAccountById(accountId) : null;
  const ownedParticipants = accountId ? await getParticipantsByAccountId(accountId) : [];
  const participantSession = ownedParticipants[0]?.id ?? null;
  const participantStatus = participantSession ? await getParticipantStatus(participantSession) : null;
  const leaderboard = getParticipantPerspectiveLeaderboard(
    await getLeaderboardParticipants(),
    participantStatus
  );
  const summary = await getParticipantSummary();
  const editParticipantId = resolvedSearchParams?.edit ?? null;
  const editParticipant =
    editParticipantId && ownedParticipants.some((participant) => participant.id === editParticipantId)
      ? await getParticipantById(editParticipantId)
      : null;
  const boardOnly = resolvedSearchParams?.view === "board";
  const showSubmitFlow =
    Boolean(accountId) &&
    (resolvedSearchParams?.submit === "1" ||
      resolvedSearchParams?.status === "error" ||
      !boardOnly);

  const ownedHighlights = ownedParticipants.map((participant) => participant.id);
  const bestOwnedEntry = leaderboard.all.find((entry) => ownedHighlights.includes(entry.id)) ?? null;

  return (
    <>
      {showSubmitFlow ? (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(circle_at_top,_rgba(255,209,102,0.14),_transparent_24%),linear-gradient(180deg,_rgba(2,6,23,0.98),_rgba(10,22,37,1))]">
          <div className="mx-auto flex h-full max-w-2xl items-stretch justify-center sm:p-6">
            <OnboardingForm
              hasError={resolvedSearchParams?.status === "error"}
              closeHref="/?view=board"
              returnTo="/?view=board"
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
        <AccountPanel
          returnTo="/?view=board"
          currentUsername={account?.username ?? null}
          authError={
            resolvedSearchParams?.authError === "login" || resolvedSearchParams?.authError === "register"
              ? resolvedSearchParams.authError
              : null
          }
        />

        <LivePresence
          participantCount={summary.participantCount}
          bestRank={bestOwnedEntry?.rank ?? null}
          bestLabel={bestOwnedEntry?.name ?? null}
          bestEntryId={bestOwnedEntry?.id ?? null}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <LeaderboardTable
            title="Damen"
            participants={leaderboard.female}
            emptyText="Noch keine freigegebenen Scores in der Damen-Rangliste."
            highlightParticipantIds={ownedHighlights}
            returnTo="/?view=board"
          />
          <LeaderboardTable
            title="Männer"
            participants={leaderboard.male}
            emptyText="Noch keine freigegebenen Scores in der Männer-Rangliste."
            highlightParticipantIds={ownedHighlights}
            returnTo="/?view=board"
          />
        </div>
      </section>

      <ScoreEntryButton href={accountId ? "/?view=board&submit=1" : "/?view=board&auth=1"} />
    </>
  );
}
