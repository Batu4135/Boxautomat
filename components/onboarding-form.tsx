"use client";

import { useState } from "react";

import { registerParticipantAction } from "@/app/actions";
import { FormSubmitButton } from "@/components/form-submit-button";
import type { Gender } from "@/lib/types";

type OnboardingFormProps = {
  hasError?: boolean;
};

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

export function OnboardingForm({ hasError = false }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender | "">("");
  const [phone, setPhone] = useState("");
  const [score, setScore] = useState("");

  const canContinueFromStepOne = name.trim().length >= 2 && gender !== "";
  const canContinueFromStepTwo = score.trim() !== "" && Number(score) >= 0;

  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/8 p-6 shadow-[0_30px_80px_rgba(2,6,23,0.45)] backdrop-blur sm:p-8">
      <div className="board-grid" aria-hidden="true" />
      <p className="relative z-10 text-sm font-semibold uppercase tracking-[0.4em] text-orange-200/80">
        Erster Scan
      </p>
      <h1 className="relative z-10 mt-3 font-display text-4xl leading-tight text-white sm:text-5xl">
        Nach dem Schlag direkt Score und Foto hochladen
      </h1>
      <p className="relative z-10 mt-4 max-w-2xl text-base leading-7 text-orange-50/85 sm:text-lg">
        Das ist ein kurzes Handy-Onboarding fuer den ersten QR-Scan. Danach merkt
        sich die App dein Geraet und zeigt dir nur noch Status, Ablauf und Rangliste.
      </p>

      <div className="relative z-10 mt-6 flex flex-wrap gap-2">
        <StepBadge step="1 Name" active={currentStep === 1} />
        <StepBadge step="2 Punkte" active={currentStep === 2} />
        <StepBadge step="3 Foto" active={currentStep === 3} />
      </div>

      {hasError ? (
        <div className="status-card status-error relative z-10 mt-6">
          Bitte pruefe Name, Geschlecht, Punktzahl und das Foto. Bilder duerfen maximal 4 MB gross sein.
        </div>
      ) : null}

      <form action={registerParticipantAction} className="relative z-10 mt-8 space-y-5">
        {currentStep === 1 ? (
          <>
            <div className="space-y-2">
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

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="gender" className="text-sm font-medium text-orange-50">
                  Geschlecht
                </label>
                <select
                  id="gender"
                  name="gender_visible"
                  required
                  value={gender}
                  onChange={(event) => setGender(event.target.value as Gender | "")}
                >
                  <option value="" disabled>
                    Bitte waehlen
                  </option>
                  <option value="female">Frau</option>
                  <option value="male">Mann</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="phone" className="text-sm font-medium text-orange-50">
                  Telefonnummer
                </label>
                <input
                  id="phone"
                  name="phone_visible"
                  type="tel"
                  maxLength={30}
                  placeholder="optional"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={!canContinueFromStepOne}
              className="cta-button cta-primary w-full disabled:opacity-60"
              onClick={() => setCurrentStep(2)}
            >
              Weiter zur Punktzahl
            </button>
          </>
        ) : null}

        {currentStep === 2 ? (
          <>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-orange-50/85">
              Trage genau die Punktzahl ein, die nach deinem Schlag auf dem Automaten stand.
            </div>
            <div className="space-y-2">
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

            <div className="flex gap-3">
              <button
                type="button"
                className="cta-button cta-secondary flex-1"
                onClick={() => setCurrentStep(1)}
              >
                Zurueck
              </button>
              <button
                type="button"
                disabled={!canContinueFromStepTwo}
                className="cta-button cta-primary flex-1 disabled:opacity-60"
                onClick={() => setCurrentStep(3)}
              >
                Weiter zum Foto
              </button>
            </div>
          </>
        ) : null}

        {currentStep === 3 ? (
          <>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-5 text-orange-50/85">
              Mach jetzt ein Foto vom Display des Boxautomaten und lade es direkt hoch.
            </div>
            <div className="space-y-2">
              <label htmlFor="photo" className="text-sm font-medium text-orange-50">
                Foto vom Score
              </label>
              <input
                id="photo"
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                required
              />
              <p className="text-xs uppercase tracking-[0.25em] text-orange-200/70">
                Maximal 4 MB, Kamera oder Galerie
              </p>
            </div>

            <input type="hidden" name="name" value={name} />
            <input type="hidden" name="gender" value={gender} />
            <input type="hidden" name="phone" value={phone} />
            <input type="hidden" name="score" value={score} />

            <div className="flex gap-3">
              <button
                type="button"
                className="cta-button cta-secondary flex-1"
                onClick={() => setCurrentStep(2)}
              >
                Zurueck
              </button>
              <FormSubmitButton className="cta-button cta-primary flex-1">
                Score und Foto senden
              </FormSubmitButton>
            </div>
          </>
        ) : null}
      </form>
    </section>
  );
}
