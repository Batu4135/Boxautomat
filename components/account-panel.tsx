import { loginAccountAction, logoutAccountAction, registerAccountAction } from "@/app/actions";

type AccountPanelProps = {
  returnTo: string;
  currentUsername: string | null;
  authError?: "login" | "register" | null;
};

export function AccountPanel({
  returnTo,
  currentUsername,
  authError = null
}: AccountPanelProps) {
  if (currentUsername) {
    return (
      <section className="app-panel flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Login</p>
          <h2 className="mt-2 font-display text-2xl text-white">{currentUsername}</h2>
          <p className="mt-2 text-sm text-white/62">
            Eingeloggt. Deine Einträge werden jetzt zuverlässig deinem Konto zugeordnet.
          </p>
        </div>

        <form action={logoutAccountAction}>
          <input type="hidden" name="returnTo" value={returnTo} />
          <button className="cta-button cta-secondary w-full sm:w-auto">Logout</button>
        </form>
      </section>
    );
  }

  return (
    <section className="app-panel px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Login</p>
        <h2 className="mt-2 font-display text-2xl text-white">Konto erstellen oder einloggen</h2>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Damit deine Einträge sicher bei dir bleiben, meldest du dich einmal mit Login-Name und
          Passwort an.
        </p>
      </div>

      {authError ? (
        <div className="status-card status-error mb-4">
          {authError === "login"
            ? "Login fehlgeschlagen. Prüfe Login-Name und Passwort."
            : "Registrierung fehlgeschlagen. Der Login-Name ist vielleicht schon vergeben oder das Passwort zu kurz."}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <form action={registerAccountAction} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <p className="text-sm font-semibold text-white">Neu registrieren</p>
          <div className="mt-3 space-y-3">
            <input name="username" type="text" required minLength={3} maxLength={32} placeholder="Login-Name" />
            <input name="password" type="password" required minLength={6} maxLength={120} placeholder="Passwort" />
            <button className="cta-button cta-primary w-full">Registrieren</button>
          </div>
        </form>

        <form action={loginAccountAction} className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
          <input type="hidden" name="returnTo" value={returnTo} />
          <p className="text-sm font-semibold text-white">Bereits registriert</p>
          <div className="mt-3 space-y-3">
            <input name="username" type="text" required minLength={3} maxLength={32} placeholder="Login-Name" />
            <input name="password" type="password" required minLength={6} maxLength={120} placeholder="Passwort" />
            <button className="cta-button cta-secondary w-full">Einloggen</button>
          </div>
        </form>
      </div>
    </section>
  );
}
