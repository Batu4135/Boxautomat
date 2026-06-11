import { EnvSetupCard } from "@/components/env-setup-card";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { getLeaderboardParticipants } from "@/lib/participants";

export const revalidate = 0;

export default async function LeaderboardPage() {
  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const leaderboard = await getLeaderboardParticipants();

  return (
    <section className="space-y-6">
      <div className="rounded-[2.5rem] border border-white/10 bg-white/8 p-6 backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200/80">
          Oeffentliche Ansicht
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">Rangliste</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-orange-50/85">
          Angezeigt werden nur freigegebene Teilnehmer mit eingetragenem Score.
          Pro Person zaehlt der hoechste hinterlegte Punktestand.
        </p>
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
  );
}
