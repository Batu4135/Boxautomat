"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { registerParticipantAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Gender } from "@/lib/types";

type OnboardingFormProps = {
  hasError?: boolean;
  closeHref?: string;
  defaultName?: string;
  defaultGender?: Gender | "";
  returnTo?: string;
};

const MOBILE_UPLOAD_TARGET_BYTES = 1_500_000;
const MAX_UPLOAD_BYTES = 4_000_000;

function StepBadge({ step, active }: { step: string; active: boolean }) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] ${
        active ? "bg-orange-400 text-slate-950" : "bg-white/8 text-orange-50/65"
      }`}
    >
      {step}
    </div>
  );
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Bild konnte nicht geladen werden."));
    };

    image.src = imageUrl;
  });
}

async function compressPhotoForUpload(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  if (file.size <= MOBILE_UPLOAD_TARGET_BYTES) {
    return file;
  }

  const image = await loadImage(file);
  const ratio = Math.min(1, 1600 / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Bild konnte nicht vorbereitet werden.");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  let quality = 0.82;
  let blob: Blob | null = null;

  while (quality >= 0.45) {
    blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", quality);
    });

    if (!blob) {
      break;
    }

    if (blob.size <= MOBILE_UPLOAD_TARGET_BYTES) {
      break;
    }

    quality -= 0.12;
  }

  if (!blob) {
    throw new Error("Bild konnte nicht vorbereitet werden.");
  }

  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now()
  });
}

export function OnboardingForm({
  hasError = false,
  closeHref,
  defaultName = "",
  defaultGender = "",
  returnTo = "/"
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState(defaultName);
  const [gender, setGender] = useState<Gender | "">(defaultGender);
  const [score, setScore] = useState("");
  const [photoName, setPhotoName] = useState("");
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const totalSteps = 4;

  useEffect(() => {
    document.body.classList.add("onboarding-open");
    document.documentElement.classList.add("onboarding-open");

    return () => {
      document.body.classList.remove("onboarding-open");
      document.documentElement.classList.remove("onboarding-open");
    };
  }, []);

  const canContinueFromStepOne = name.trim().length >= 2;
  const canContinueFromStepThree = score.trim() !== "" && Number(score) >= 0;

  async function handleSubmit(formData: FormData) {
    setClientError(null);
    setIsPreparingUpload(true);

    try {
      const currentPhoto = formData.get("photo");

      if (!(currentPhoto instanceof File) || currentPhoto.size === 0) {
        setClientError("Bitte waehle ein Foto vom Score aus.");
        setIsPreparingUpload(false);
        return;
      }

      if (!currentPhoto.type.startsWith("image/")) {
        setClientError("Bitte lade nur ein Bild hoch.");
        setIsPreparingUpload(false);
        return;
      }

      const preparedPhoto = await compressPhotoForUpload(currentPhoto);

      if (preparedPhoto.size > MAX_UPLOAD_BYTES) {
        setClientError(
          "Das Foto ist noch zu gross. Bitte gehe naeher ans Display oder waehle ein kleineres Bild."
        );
        setIsPreparingUpload(false);
        return;
      }

      formData.set("photo", preparedPhoto);
    } catch {
      setClientError(
        "Das Foto konnte gerade nicht gesendet werden. Bitte versuche es noch einmal."
      );
      setIsPreparingUpload(false);
      return;
    }

    try {
      await registerParticipantAction(formData);
    } finally {
      setIsPreparingUpload(false);
    }
  }

  return (
    <section className="relative flex h-[100svh] w-full flex-col overflow-y-auto bg-[linear-gradient(180deg,rgba(15,23,42,0.995),rgba(30,41,59,0.98))] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] [scrollbar-width:none] [-ms-overflow-style:none] sm:h-auto sm:max-h-[calc(100svh-3rem)] sm:max-w-2xl sm:rounded-[2.5rem] sm:border sm:border-white/10 sm:bg-white/8 sm:px-6 sm:py-6 sm:shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:backdrop-blur [&::-webkit-scrollbar]:hidden">
      <div className="board-grid" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-orange-400/15 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-orange-200/80">
          Score Upload
        </p>
        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-orange-50/85">
            {currentStep}/{totalSteps}
          </div>
          {closeHref ? (
            <Link
              href={closeHref}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/8 text-lg text-white/80 transition hover:bg-white/12"
            >
              ×
            </Link>
          ) : null}
        </div>
      </div>

      <div className="relative z-10 mt-4 flex flex-wrap gap-2">
        <StepBadge step="Name" active={currentStep === 1} />
        <StepBadge step="Geschlecht" active={currentStep === 2} />
        <StepBadge step="Punkte" active={currentStep === 3} />
        <StepBadge step="Foto" active={currentStep === 4} />
      </div>

      {hasError ? (
        <div className="status-card status-error relative z-10 mt-4">
          Bitte pruefe Name, Geschlecht, Punktzahl und das Foto. Bei grossen Handyfotos wird das Bild automatisch verkleinert.
        </div>
      ) : null}

      {clientError ? (
        <div className="status-card status-error relative z-10 mt-4">{clientError}</div>
      ) : null}

      <form action={handleSubmit} className="relative z-10 mt-4 flex flex-1 flex-col">
        <div className="flex flex-1 flex-col justify-center py-4">
          {currentStep === 1 ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                  Schritt 1
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                  Wie heisst du?
                </h1>
                <p className="mt-4 text-base leading-7 text-orange-50/85 sm:text-lg">
                  Gib nur deinen Namen ein. Danach kommt sofort die naechste Frage.
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="name" className="text-sm font-medium text-orange-50">
                  Name
                </label>
                <input
                  id="name"
                  name="name_visible"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Dein Name"
                  autoFocus
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                  Schritt 2
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                  Waehle dein Geschlecht
                </h1>
                <p className="mt-4 text-base leading-7 text-orange-50/85 sm:text-lg">
                  Tippe auf die passende Auswahl. Die Rangliste wird danach in die richtige Kategorie einsortiert.
                </p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  className={`rounded-[1.75rem] border px-5 py-6 text-left text-xl font-semibold transition active:scale-[0.99] ${
                    gender === "female"
                      ? "border-orange-300 bg-orange-400 text-slate-950"
                      : "border-white/10 bg-white/8 text-white"
                  }`}
                  onClick={() => setGender("female")}
                >
                  Frau
                </button>
                <button
                  type="button"
                  className={`rounded-[1.75rem] border px-5 py-6 text-left text-xl font-semibold transition active:scale-[0.99] ${
                    gender === "male"
                      ? "border-orange-300 bg-orange-400 text-slate-950"
                      : "border-white/10 bg-white/8 text-white"
                  }`}
                  onClick={() => setGender("male")}
                >
                  Mann
                </button>
              </div>
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                  Schritt 3
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                  Wie viele Punkte hattest du?
                </h1>
                <p className="mt-4 text-base leading-7 text-orange-50/85 sm:text-lg">
                  Trage genau die Punktzahl ein, die auf dem Automaten stand.
                </p>
              </div>

              <div className="space-y-3">
                <label htmlFor="score" className="text-sm font-medium text-orange-50">
                  Punktzahl
                </label>
                <input
                  id="score"
                  name="score_visible"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  placeholder="z. B. 742"
                  autoFocus
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                />
              </div>
            </div>
          ) : null}

          {currentStep === 4 ? (
            <div className="space-y-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                  Schritt 4
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                  Mach jetzt ein Foto vom Display
                </h1>
                <p className="mt-4 text-base leading-7 text-orange-50/85 sm:text-lg">
                  Fotografiere direkt den Score auf dem Automaten und lade das Bild hoch.
                </p>
              </div>

              <div className="rounded-[1.75rem] border border-white/10 bg-white/8 p-4">
                <div className="mb-4 flex flex-wrap gap-2 text-sm text-orange-50/85">
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    {name || "Name"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    {gender === "female" ? "Frau" : "Mann"}
                  </span>
                  <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1">
                    {score || "0"} Punkte
                  </span>
                </div>

                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  capture="environment"
                  required
                  className="sr-only"
                  onChange={(event) =>
                    setPhotoName(event.target.files?.[0]?.name ?? "")
                  }
                />
                <label
                  htmlFor="photo"
                  className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-orange-300/45 bg-black/20 px-5 py-6 text-center transition active:scale-[0.99]"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.35em] text-orange-200/80">
                    Foto vom Score
                  </span>
                  <span className="mt-3 font-display text-2xl text-white">
                    {photoName ? "Foto ausgewaehlt" : "Kamera oeffnen oder Bild waehlen"}
                  </span>
                  <span className="mt-3 text-sm leading-6 text-orange-50/80">
                    {photoName || "Handyfotos werden automatisch fuer den Upload verkleinert."}
                  </span>
                </label>
              </div>

              <input type="hidden" name="name" value={name} />
              <input type="hidden" name="gender" value={gender} />
              <input type="hidden" name="phone" value="" />
              <input type="hidden" name="score" value={score} />
              <input type="hidden" name="returnTo" value={returnTo} />
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mt-auto space-y-3 pb-1 pt-6">
          {currentStep === 1 ? (
            <button
              type="button"
              disabled={!canContinueFromStepOne}
              className="cta-button cta-primary w-full disabled:opacity-60"
              onClick={() => setCurrentStep(2)}
            >
              Weiter
            </button>
          ) : null}

          {currentStep === 2 ? (
            <>
              <button
                type="button"
                disabled={!gender}
                className="cta-button cta-primary w-full disabled:opacity-60"
                onClick={() => setCurrentStep(3)}
              >
                Weiter
              </button>
              <button
                type="button"
                className="cta-button cta-secondary w-full"
                onClick={() => setCurrentStep(1)}
              >
                Zurueck
              </button>
            </>
          ) : null}

          {currentStep === 3 ? (
            <>
              <button
                type="button"
                disabled={!canContinueFromStepThree}
                className="cta-button cta-primary w-full disabled:opacity-60"
                onClick={() => setCurrentStep(4)}
              >
                Weiter
              </button>
              <button
                type="button"
                className="cta-button cta-secondary w-full"
                onClick={() => setCurrentStep(2)}
              >
                Zurueck
              </button>
            </>
          ) : null}

          {currentStep === 4 ? (
            <>
              <FormSubmitButton className="cta-button cta-primary w-full">
                {isPreparingUpload
                  ? "Foto wird vorbereitet..."
                  : "Foto absenden und Rangliste ansehen"}
              </FormSubmitButton>
              <button
                type="button"
                className="cta-button cta-secondary w-full"
                disabled={isPreparingUpload}
                onClick={() => setCurrentStep(3)}
              >
                Zurueck
              </button>
            </>
          ) : null}
        </div>
      </form>
    </section>
  );
}
