"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  clearAdminSession,
  clearParticipantSession,
  requireAdmin,
  setAdminSession,
  setParticipantSession
} from "@/lib/auth";
import {
  approveParticipant,
  createParticipant,
  deleteParticipant,
  updateParticipantScore
} from "@/lib/participants";
import type { Gender } from "@/lib/types";

function parseGender(value: FormDataEntryValue | null): Gender | null {
  if (value === "female" || value === "male") {
    return value;
  }

  return null;
}

function safeText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function registerParticipantAction(formData: FormData) {
  const name = safeText(formData.get("name"));
  const gender = parseGender(formData.get("gender"));
  const phone = safeText(formData.get("phone"));

  if (name.length < 2 || name.length > 80 || !gender) {
    redirect("/?status=error");
  }

  const participant = await createParticipant({
    name,
    gender,
    phone
  });

  await setParticipantSession(participant.id);
  revalidatePath("/");
  redirect("/?status=success");
}

export async function resetParticipantSessionAction() {
  await clearParticipantSession();
  redirect("/");
}

export async function adminLoginAction(formData: FormData) {
  const password = safeText(formData.get("password"));

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    redirect("/admin?login=error");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/admin");
}

export async function approveParticipantAction(formData: FormData) {
  await requireAdmin();

  const id = safeText(formData.get("id"));

  if (!id) {
    throw new Error("Teilnehmer-ID fehlt.");
  }

  await approveParticipant(id);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/rangliste");
}

export async function updateParticipantScoreAction(formData: FormData) {
  await requireAdmin();

  const id = safeText(formData.get("id"));
  const scoreValue = safeText(formData.get("score"));
  const parsedScore = Number(scoreValue);

  if (!id || !Number.isFinite(parsedScore) || parsedScore < 0) {
    throw new Error("Ungueltiger Score.");
  }

  await updateParticipantScore(id, Math.round(parsedScore));
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/rangliste");
}

export async function deleteParticipantAction(formData: FormData) {
  await requireAdmin();

  const id = safeText(formData.get("id"));

  if (!id) {
    throw new Error("Teilnehmer-ID fehlt.");
  }

  await deleteParticipant(id);
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/rangliste");
}
