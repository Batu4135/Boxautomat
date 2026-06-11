import { restoreEntriesByRecoveryCodeAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

type RecoveryPanelProps = {
  returnTo: string;
  hasError?: boolean;
};

export function RecoveryPanel({ returnTo, hasError = false }: RecoveryPanelProps) {
  return (
    <section className="app-panel px-4 py-4 sm:px-5 sm:py-5">
      <div className="mb-4">
        <p className="text-[11px] uppercase tracking-[0.35em] text-white/40">Sicherheit</p>
        <h2 className="mt-2 font-display text-2xl text-white">Einträge wiederherstellen</h2>
        <p className="mt-2 text-sm leading-6 text-white/62">
          Wenn Safari oder Chrome Browserdaten gelöscht hat, kannst du deine Einträge mit deinem
          Sicherungscode sofort wieder auf dieses Gerät holen.
        </p>
      </div>

      {hasError ? (
        <div className="status-card status-error mb-4">
          Der Sicherungscode wurde nicht gefunden. Prüfe die Eingabe noch einmal.
        </div>
      ) : null}

      <form action={restoreEntriesByRecoveryCodeAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <input type="hidden" name="returnTo" value={returnTo} />
        <input
          name="recoveryCode"
          type="text"
          required
          autoCapitalize="characters"
          placeholder="Sicherungscode eingeben"
        />
        <FormSubmitButton className="cta-button cta-primary whitespace-nowrap">
          Wiederherstellen
        </FormSubmitButton>
      </form>
    </section>
  );
}
