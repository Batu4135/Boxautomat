type EnvSetupCardProps = {
  missingEnvVars: string[];
};

export function EnvSetupCard({ missingEnvVars }: EnvSetupCardProps) {
  return (
    <section className="rounded-[2.25rem] border border-rose-300/20 bg-rose-400/10 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-100/85">
        Setup fehlt
      </p>
      <h1 className="mt-3 font-display text-4xl text-white">
        Die App braucht noch deine Datenbank-ENV
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-orange-50/90">
        Im Moment fehlt noch die Verbindung zu deiner Postgres-Datenbank. Lege
        im Projekt eine Datei <code>.env.local</code> an und trage diese Werte ein:
      </p>

      <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/25 p-4 text-sm text-orange-50/90">
        <code className="block">DATABASE_URL=postgres://user:password@host:5432/database</code>
        <code className="mt-2 block">ADMIN_PASSWORD=choose-a-strong-password</code>
      </div>

      <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/15 p-4 text-sm text-orange-50/85">
        Fehlend: {missingEnvVars.join(", ")}
      </div>
    </section>
  );
}
