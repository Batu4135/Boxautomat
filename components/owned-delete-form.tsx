"use client";

import { deleteOwnedParticipantAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";

type OwnedDeleteFormProps = {
  id: string;
  returnTo: string;
  label?: string;
  children: React.ReactNode;
};

export function OwnedDeleteForm({
  id,
  returnTo,
  label = "Eintrag löschen",
  children
}: OwnedDeleteFormProps) {
  return (
    <form
      action={deleteOwnedParticipantAction}
      onSubmit={(event) => {
        const confirmed = window.confirm("Bist du sicher, dass du diesen Eintrag löschen möchtest?");

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <FormSubmitButton
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-300/20 bg-rose-500/10 text-rose-100 transition hover:bg-rose-500/15"
        aria-label={label}
      >
        {children}
      </FormSubmitButton>
    </form>
  );
}
