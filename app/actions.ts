"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { clearAdminSession, requireAdmin, setAdminSession, setParticipantSession } from "@/lib/auth";
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

function safeReturnPath(value: FormDataEntryValue | null) {
  const resolved = safeText(value);

  if (!resolved.startsWith("/") || resolved.startsWith("//")) {
    return "/";
  }

  return resolved;
}

export async function registerParticipantAction(formData: FormData) {
  const name = safeText(formData.get("name"));
  const gender = parseGender(formData.get("gender"));
  const phone = safeText(formData.get("phone"));
  const scoreValue = safeText(formData.get("score"));
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const parsedScore = Number(scoreValue);
  const photo = formData.get("photo");

  if (
    name.length < 2 ||
    name.length > 80 ||
    !gender ||
    !Number.isFinite(parsedScore) ||
    parsedScore < 0 ||
    !(photo instanceof File) ||
    photo.size === 0 ||
    photo.size > 4 * 1024 * 1024
  ) {
    redirect(`${returnTo}?submit=1&status=error`);
  }

  const contentType = photo.type || "image/jpeg";

  if (!contentType.startsWith("image/")) {
    redirect(`${returnTo}?submit=1&status=error`);
  }

  const participant = await createParticipant({
    name,
    gender,
    phone,
    score: Math.round(parsedScore),
    photoData: Buffer.from(await photo.arrayBuffer()),
    photoContentType: contentType,
    photoFileName: safeText(photo.name) || `${name}-score.jpg`
  });

  await setParticipantSession(participant.id);
  revalidatePath("/");
  revalidatePath("/rangliste");
  redirect(returnTo);
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
