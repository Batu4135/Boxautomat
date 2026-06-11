"use client";

import NextImage from "next/image";
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
  defaultScore?: number;
  editParticipantId?: string;
  hasExistingPhoto?: boolean;
  returnTo?: string;
};

const MOBILE_UPLOAD_TARGET_BYTES = 1_500_000;
const MAX_UPLOAD_BYTES = 4_000_000;

function StepBadge({ step, active }: { step: string; active: boolean }) {
  return (
    <div
      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] transition ${
        active
          ? "bg-[#ffd166] text-slate-950 shadow-[0_10px_25px_rgba(255,209,102,0.28)]"
          : "bg-white/8 text-white/55"
      }`}
    >
      {step}
    </div>
  );
}

function GenderCard({
  active,
  gender,
  title,
  icon,
  onClick
}: {
  active: boolean;
  gender: Gender;
  title: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-3 rounded-[1.5rem] border px-4 py-4 text-left transition active:scale-[0.99] ${
        active
          ? "border-[#ffd166] bg-[#ffd166] text-slate-950 shadow-[0_16px_35px_rgba(255,209,102,0.24)]"
          : "border-white/10 bg-black/20 text-white"
      }`}
      onClick={onClick}
      aria-label={`${title} auswählen`}
      data-gender={gender}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-current/15 bg-current/10 text-2xl">
        {icon}
      </span>
      <span className="text-lg font-semibold">{title}</span>
    </button>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 8.5C4 7.12 5.12 6 6.5 6H8l1.2-1.8c.28-.42.76-.67 1.26-.67h2.08c.5 0 .98.25 1.26.67L15 6h2.5C18.88 6 20 7.12 20 8.5v8C20 17.88 18.88 19 17.5 19h-11C5.12 19 4 17.88 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.5" />
    </svg>
  );
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new window.Image();

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
  defaultScore,
  editParticipantId,
  hasExistingPhoto = false,
  returnTo = "/"
}: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [nickname, setNickname] = useState(defaultName);
  const [gender, setGender] = useState<Gender | "">(defaultGender);
  const [score, setScore] = useState(defaultScore ? String(defaultScore) : "");
  const [photoName, setPhotoName] = useState(hasExistingPhoto ? "Vorhandenes Bild" : "");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const [isPreparingUpload, setIsPreparingUpload] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const totalSteps = 3;

  useEffect(() => {
    document.body.classList.add("onboarding-open");
    document.documentElement.classList.add("onboarding-open");

    return () => {
      document.body.classList.remove("onboarding-open");
      document.documentElement.classList.remove("onboarding-open");
    };
  }, []);

  useEffect(() => {
    return () => {
      if (photoPreviewUrl) {
        URL.revokeObjectURL(photoPreviewUrl);
      }
    };
  }, [photoPreviewUrl]);

  const canContinueFromStepOne = !!selectedPhoto || hasExistingPhoto;
  const canContinueFromStepTwo = score.trim() !== "" && Number(score) >= 0;
  const canSubmit = nickname.trim().length >= 2 && !!gender && (!!selectedPhoto || hasExistingPhoto);

  async function handleSubmit(formData: FormData) {
    setClientError(null);
    setIsPreparingUpload(true);

    try {
      const currentPhoto = selectedPhoto;

      if (!currentPhoto && !editParticipantId) {
        setClientError("Bitte wähle ein Foto vom Score aus.");
        setIsPreparingUpload(false);
        return;
      }

      if (currentPhoto && !currentPhoto.type.startsWith("image/")) {
        setClientError("Bitte lade nur ein Bild hoch.");
        setIsPreparingUpload(false);
        return;
      }

      const preparedPhoto = currentPhoto
        ? await compressPhotoForUpload(currentPhoto)
        : null;

      if (preparedPhoto && preparedPhoto.size > MAX_UPLOAD_BYTES) {
        setClientError(
          "Das Foto ist noch zu groß. Bitte gehe näher ans Display oder wähle ein kleineres Bild."
        );
        setIsPreparingUpload(false);
        return;
      }

      if (preparedPhoto) {
        formData.set("photo", preparedPhoto);
      } else {
        formData.delete("photo");
      }
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
    <section className="relative flex h-[100svh] w-full flex-col overflow-y-auto rounded-none bg-[linear-gradient(180deg,rgba(6,14,26,0.995),rgba(11,27,45,0.98))] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))] [scrollbar-width:none] [-ms-overflow-style:none] sm:h-auto sm:max-h-[calc(100svh-3rem)] sm:max-w-2xl sm:rounded-[2.8rem] sm:border sm:border-white/10 sm:bg-[linear-gradient(180deg,rgba(9,20,34,0.96),rgba(11,31,51,0.93))] sm:px-7 sm:py-7 sm:shadow-[0_35px_90px_rgba(2,8,23,0.48)] [&::-webkit-scrollbar]:hidden">
      <div className="board-grid" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#ffd166]/10 to-transparent" />

      <div className="relative z-10 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-white/45">
            Upload
          </p>
          <p className="mt-2 font-display text-lg text-white">Neuen Score eintragen</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-xs text-white/80">
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

      <div className="relative z-10 mt-5 flex flex-wrap gap-2">
        <StepBadge step="Foto" active={currentStep === 1} />
        <StepBadge step="Punkte" active={currentStep === 2} />
        <StepBadge step="Spitzname" active={currentStep === 3} />
      </div>

      {hasError ? (
        <div className="status-card status-error relative z-10 mt-4">
          Bitte prüfe Spitzname, Board, Punktzahl und das Foto. Große Handyfotos werden automatisch verkleinert.
        </div>
      ) : null}

      {clientError ? (
        <div className="status-card status-error relative z-10 mt-4">{clientError}</div>
      ) : null}

      <form action={handleSubmit} className="relative z-10 mt-4 flex flex-1 flex-col">
        {currentStep === 1 ? (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                Schritt 1
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                Bild hochladen
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Fotografiere direkt den Score auf dem Automaten oder wähle ein Bild aus deiner Foto-Mediathek.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.07] p-4">
              <input
                id="photo"
                name="photo_picker"
                type="file"
                accept="image/*"
                required
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;

                  if (photoPreviewUrl) {
                    URL.revokeObjectURL(photoPreviewUrl);
                  }

                  setSelectedPhoto(file);
                  setPhotoName(file?.name ?? "");
                  setPhotoPreviewUrl(file ? URL.createObjectURL(file) : null);
                }}
              />
              <label
                htmlFor="photo"
                className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-[#ffd166]/35 bg-[radial-gradient(circle_at_top,rgba(255,209,102,0.09),transparent_45%),rgba(0,0,0,0.18)] px-5 py-6 text-center transition active:scale-[0.99]"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/8 text-[#ffd166]">
                  <CameraIcon />
                </div>
                <span className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                  Score-Foto
                </span>
                  <span className="mt-3 font-display text-2xl text-white">
                  {photoName ? "Bild ausgewählt" : "Kamera oder Mediathek"}
                  </span>
                <span className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                  {photoName ||
                    "Du kannst direkt fotografieren oder ein Bild aus deiner Foto-Mediathek auswählen."}
                </span>
              </label>

              {photoPreviewUrl ? (
                <div className="mt-4 overflow-hidden rounded-[1.4rem] border border-white/10 bg-black/20">
                  <NextImage
                    src={photoPreviewUrl}
                    alt="Vorschau des ausgewählten Score-Fotos"
                    width={1200}
                    height={720}
                    unoptimized
                    className="h-36 w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="mt-4">
                <button
                  type="button"
                  disabled={!canContinueFromStepOne}
                  className="cta-button cta-primary w-full disabled:opacity-60"
                  onClick={() => setCurrentStep(2)}
                >
                  Weiter
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                Schritt 2
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                Deine Punktzahl
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Trage genau die Punktzahl ein, die auf dem Automaten stand.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.07] p-4">
              <label htmlFor="score" className="text-sm font-medium text-white/85">
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
                className="mt-3"
              />

              <div className="mt-4 flex flex-col gap-3">
                <button
                  type="button"
                  disabled={!canContinueFromStepTwo}
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
                  Zurück
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {currentStep === 3 ? (
          <div className="space-y-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/55">
                Schritt 3
              </p>
              <h1 className="mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
                Spitzname
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-300 sm:text-lg">
                Gib deinen Spitznamen ein und wähle dein Board aus.
              </p>
            </div>

            <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.07] p-4">
              <div className="mb-4 flex flex-wrap gap-2 text-sm">
                <span className="rounded-full border border-emerald-300/25 bg-emerald-400/14 px-3 py-1 font-medium text-emerald-100">
                  {photoName ? "Bild bereit" : "Kein Bild"}
                </span>
                <span className="rounded-full border border-emerald-300/25 bg-emerald-400/14 px-3 py-1 font-medium text-emerald-100">
                  {score || "0"} Punkte
                </span>
                <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-white/75">
                  Name
                </span>
              </div>

              <div className="space-y-3">
                <label htmlFor="nickname" className="text-sm font-medium text-white/85">
                  Spitzname
                </label>
                <input
                  id="nickname"
                  name="nickname_visible"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  placeholder="Spitzname eingeben"
                  autoFocus
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <GenderCard
                  active={gender === "female"}
                  gender="female"
                  title="Frauen"
                  icon="👩"
                  onClick={() => setGender("female")}
                />
                <GenderCard
                  active={gender === "male"}
                  gender="male"
                  title="Männer"
                  icon="👨"
                  onClick={() => setGender("male")}
                />
              </div>

              <input type="hidden" name="name" value={nickname} />
              <input type="hidden" name="gender" value={gender} />
              <input type="hidden" name="phone" value="" />
              <input type="hidden" name="score" value={score} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="editParticipantId" value={editParticipantId ?? ""} />

              <div className="mt-4 flex flex-col gap-3">
                <FormSubmitButton
                  className="cta-button cta-primary w-full"
                  disabled={!canSubmit || isPreparingUpload}
                >
                  {isPreparingUpload
                    ? "Eintrag wird vorbereitet..."
                    : "Speichern und Rangliste ansehen"}
                </FormSubmitButton>
                <button
                  type="button"
                  className="cta-button cta-secondary w-full"
                  disabled={isPreparingUpload}
                  onClick={() => setCurrentStep(2)}
                >
                  Zurück
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </form>
    </section>
  );
}
