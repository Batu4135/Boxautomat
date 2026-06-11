import Link from "next/link";

import {
  adminLoginAction,
  adminLogoutAction,
  approveParticipantAction,
  deleteParticipantAction,
  updateParticipantScoreAction
} from "@/app/actions";
import { EnvSetupCard } from "@/components/env-setup-card";
import { FormSubmitButton } from "@/components/form-submit-button";
import { isAdminAuthenticated } from "@/lib/auth";
import { getMissingEnvVars, hasRequiredEnvVars } from "@/lib/env";
import { getAdminParticipants } from "@/lib/participants";
import type { Gender, ParticipantRow } from "@/lib/types";

type AdminPageProps = {
  searchParams?: Promise<{
    filter?: string;
    login?: string;
  }>;
};

const filterOptions: Array<{ label: string; value: Gender | "all" }> = [
  { label: "Alle", value: "all" },
  { label: "Frauen", value: "female" },
  { label: "Maenner", value: "male" }
];

function FilterLink({
  currentFilter,
  value,
  label
}: {
  currentFilter: Gender | "all";
  value: Gender | "all";
  label: string;
}) {
  const active = currentFilter === value;

  return (
    <Link
      href={value === "all" ? "/admin" : `/admin?filter=${value}`}
      className={`rounded-full px-4 py-2 text-sm transition ${
        active
          ? "bg-orange-400 text-slate-950"
          : "border border-white/15 bg-white/8 text-orange-50 hover:bg-white/15"
      }`}
    >
      {label}
    </Link>
  );
}

function AdminParticipantCard({
  participant,
  emphasizeWaiting = false
}: {
  participant: ParticipantRow;
  emphasizeWaiting?: boolean;
}) {
  return (
    <article
      className={`rounded-[2rem] border p-5 backdrop-blur ${
        emphasizeWaiting
          ? "border-amber-300/25 bg-amber-300/10"
          : "border-white/10 bg-white/8"
      }`}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl text-white">{participant.name}</h2>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-[0.25em] text-orange-100">
              {participant.gender === "female" ? "Frau" : "Mann"}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                participant.score !== null
                  ? "bg-emerald-500/20 text-emerald-100"
                  : participant.approved
                    ? "bg-sky-500/20 text-sky-100"
                    : "bg-amber-400/20 text-amber-100"
              }`}
            >
              {participant.score !== null
                ? "Score gespeichert"
                : participant.approved
                  ? "Freigegeben, Score offen"
                  : "Neu in Warteschlange"}
            </span>
          </div>
          <p className="text-sm text-orange-50/80">
            Telefon: {participant.phone || "nicht angegeben"}
          </p>
          <p className="text-sm text-orange-50/80">
            Aktueller Score: {participant.score ?? "noch offen"}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-orange-200/70">
            Angemeldet am {new Date(participant.created_at).toLocaleString("de-DE")}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[auto_1fr_auto] sm:items-end">
          {!participant.approved ? (
            <form action={approveParticipantAction}>
              <input type="hidden" name="id" value={participant.id} />
              <FormSubmitButton className="cta-button cta-secondary w-full">
                Freigeben
              </FormSubmitButton>
            </form>
          ) : (
            <div className="hidden sm:block" />
          )}

          <form action={updateParticipantScoreAction} className="grid gap-2 sm:min-w-[15rem]">
            <input type="hidden" name="id" value={participant.id} />
            <label className="text-sm font-medium text-orange-50" htmlFor={`score-${participant.id}`}>
              Punkte eintragen
            </label>
            <input
              id={`score-${participant.id}`}
              name="score"
              type="number"
              min={0}
              step={1}
              placeholder="Score"
              defaultValue={participant.score ?? ""}
            />
            <FormSubmitButton className="cta-button cta-primary w-full">
              Score speichern
            </FormSubmitButton>
          </form>

          <form action={deleteParticipantAction}>
            <input type="hidden" name="id" value={participant.id} />
            <FormSubmitButton className="cta-button w-full border border-red-300/25 bg-red-500/15 text-red-50">
              Loeschen
            </FormSubmitButton>
          </form>
        </div>
      </div>
    </article>
  );
}

function AdminSection({
  title,
  description,
  participants,
  emphasizeWaiting = false
}: {
  title: string;
  description: string;
  participants: ParticipantRow[];
  emphasizeWaiting?: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-white">{title}</h2>
          <p className="mt-1 text-sm text-orange-50/75">{description}</p>
        </div>
        <div className="rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-orange-50">
          {participants.length}
        </div>
      </div>

      {participants.length === 0 ? (
        <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-5 text-sm text-orange-50/80 backdrop-blur">
          In diesem Bereich ist gerade nichts offen.
        </div>
      ) : (
        <div className="grid gap-4">
          {participants.map((participant) => (
            <AdminParticipantCard
              key={participant.id}
              participant={participant}
              emphasizeWaiting={emphasizeWaiting}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const resolvedSearchParams = await searchParams;

  if (!hasRequiredEnvVars()) {
    return <EnvSetupCard missingEnvVars={getMissingEnvVars()} />;
  }

  const isLoggedIn = await isAdminAuthenticated();
  const filter =
    resolvedSearchParams?.filter === "female" || resolvedSearchParams?.filter === "male"
      ? resolvedSearchParams.filter
      : "all";

  if (!isLoggedIn) {
    return (
      <section className="mx-auto max-w-xl rounded-[2.5rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.4)] backdrop-blur sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200/80">
          Admin
        </p>
        <h1 className="mt-3 font-display text-4xl text-white">Admin Login</h1>
        <p className="mt-4 text-base leading-7 text-orange-50/85">
          Hier siehst du sofort, wer in der Warteschlange steht und kannst Punkte speichern.
        </p>

        {resolvedSearchParams?.login === "error" ? (
          <div className="status-card status-error mt-6">
            Das Passwort war nicht korrekt.
          </div>
        ) : null}

        <form action={adminLoginAction} className="mt-8 space-y-5">
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-orange-50">
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Admin Passwort"
            />
          </div>

          <FormSubmitButton className="cta-button cta-primary w-full">
            Einloggen
          </FormSubmitButton>
        </form>
      </section>
    );
  }

  const participants = await getAdminParticipants(filter);
  const waitingParticipants = participants.filter(
    (participant) => !participant.approved && participant.score === null
  );
  const approvedWithoutScore = participants.filter(
    (participant) => participant.approved && participant.score === null
  );
  const scoredParticipants = participants.filter((participant) => participant.score !== null);

  return (
    <section className="space-y-6">
      <div className="rounded-[2.5rem] border border-white/10 bg-white/8 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-200/80">
              Admin Bereich
            </p>
            <h1 className="mt-3 font-display text-4xl text-white">Warteschlange und Scores</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-orange-50/85">
              Neue Eintraege landen sofort oben. Du kannst freigeben, direkt Punkte eintragen
              und die Rangliste aktualisiert sich automatisch auf der Startseite.
            </p>
          </div>

          <form action={adminLogoutAction}>
            <FormSubmitButton className="cta-button cta-secondary min-w-[11rem]">
              Ausloggen
            </FormSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/10 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-amber-100/80">Neu</p>
          <p className="mt-2 font-display text-4xl text-white">{waitingParticipants.length}</p>
          <p className="mt-2 text-sm text-orange-50/75">Warten auf Freigabe oder Score</p>
        </div>
        <div className="rounded-[1.75rem] border border-sky-300/20 bg-sky-400/10 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-100/80">Offen</p>
          <p className="mt-2 font-display text-4xl text-white">{approvedWithoutScore.length}</p>
          <p className="mt-2 text-sm text-orange-50/75">Schon freigegeben, Score fehlt noch</p>
        </div>
        <div className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-400/10 p-5 backdrop-blur">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-100/80">Gespeichert</p>
          <p className="mt-2 font-display text-4xl text-white">{scoredParticipants.length}</p>
          <p className="mt-2 text-sm text-orange-50/75">Teilnehmer mit fertigem Score</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {filterOptions.map((option) => (
          <FilterLink
            key={option.value}
            currentFilter={filter}
            value={option.value}
            label={option.label}
          />
        ))}
      </div>

      <AdminSection
        title="Warteschlange"
        description="Diese Teilnehmer haben sich gerade eingetragen und warten auf den naechsten Schritt."
        participants={waitingParticipants}
        emphasizeWaiting
      />

      <AdminSection
        title="Freigegeben ohne Score"
        description="Diese Teilnehmer koennen jederzeit einen eingetragenen Punktestand bekommen."
        participants={approvedWithoutScore}
      />

      <AdminSection
        title="Gespeicherte Scores"
        description="Hier kannst du Werte spaeter noch aktualisieren oder Eintraege loeschen."
        participants={scoredParticipants}
      />
    </section>
  );
}
