"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { authenticateAccount, createAccount } from "@/lib/accounts";
import {
  clearAdminSession,
  clearUserSession,
  getOwnedParticipantIds,
  requireAdmin,
  requireUserSession,
  setAdminSession,
  setOwnedParticipants,
  setParticipantSession,
  setUserSession
} from "@/lib/auth";
import {
  approveParticipant,
  assignAccountToParticipants,
  createParticipant,
  deleteParticipant,
  getParticipantById,
  updateParticipantSubmission,
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

function withQuery(path: string, query: Record<string, string>) {
  const url = new URL(path, "https://boxautomat.local");

  for (const [key, value] of Object.entries(query)) {
    url.searchParams.set(key, value);
  }

  const search = url.searchParams.toString();
  return `${url.pathname}${search ? `?${search}` : ""}`;
}

async function attachLegacyOwnedEntriesToAccount(accountId: string) {
  const legacyOwnedIds = await getOwnedParticipantIds();

  if (legacyOwnedIds.length === 0) {
    return;
  }

  await assignAccountToParticipants(legacyOwnedIds, accountId);
  await setOwnedParticipants([]);
}

async function requireParticipantAccountOwnership(participantId: string) {
  const accountId = await requireUserSession();
  const participant = await getParticipantById(participantId);

  if (!participant || participant.account_id !== accountId) {
    throw new Error("Nicht autorisiert.");
  }

  return { accountId, participant };
}

export async function registerAccountAction(formData: FormData) {
  const username = safeText(formData.get("username"));
  const password = safeText(formData.get("password"));
  const returnTo = safeReturnPath(formData.get("returnTo"));

  if (username.length < 3 || username.length > 32 || password.length < 6 || password.length > 120) {
    redirect(withQuery(returnTo, { auth: "1", authError: "register" }));
  }

  try {
    const account = await createAccount({ username, password });

    if (!account) {
      redirect(withQuery(returnTo, { auth: "1", authError: "register" }));
    }

    await setUserSession(account.id);
    await attachLegacyOwnedEntriesToAccount(account.id);
    revalidatePath("/");
    revalidatePath("/rangliste");
    redirect(returnTo);
  } catch {
    redirect(withQuery(returnTo, { auth: "1", authError: "register" }));
  }
}

export async function loginAccountAction(formData: FormData) {
  const username = safeText(formData.get("username"));
  const password = safeText(formData.get("password"));
  const returnTo = safeReturnPath(formData.get("returnTo"));

  const account = await authenticateAccount({ username, password });

  if (!account) {
    redirect(withQuery(returnTo, { auth: "1", authError: "login" }));
  }

  await setUserSession(account.id);
  await attachLegacyOwnedEntriesToAccount(account.id);
  revalidatePath("/");
  revalidatePath("/rangliste");
  redirect(returnTo);
}

export async function logoutAccountAction(formData: FormData) {
  const returnTo = safeReturnPath(formData.get("returnTo"));

  await clearUserSession();
  redirect(returnTo);
}

export async function registerParticipantAction(formData: FormData) {
  const accountId = await requireUserSession();
  const name = safeText(formData.get("name"));
  const gender = parseGender(formData.get("gender"));
  const phone = safeText(formData.get("phone"));
  const scoreValue = safeText(formData.get("score"));
  const returnTo = safeReturnPath(formData.get("returnTo"));
  const editParticipantId = safeText(formData.get("editParticipantId"));
  const ownerToken = safeText(formData.get("ownerToken"));
  const recoveryCode = safeText(formData.get("recoveryCode"));
  const parsedScore = Number(scoreValue);
  const photo = formData.get("photo");

  if (
    name.length < 2 ||
    name.length > 80 ||
    !gender ||
    !Number.isFinite(parsedScore) ||
    parsedScore < 0 ||
    ((!(photo instanceof File) || photo.size === 0) && !editParticipantId)
  ) {
    redirect(withQuery(returnTo, { submit: "1", status: "error" }));
  }

  if (photo instanceof File && photo.size > 4 * 1024 * 1024) {
    redirect(withQuery(returnTo, { submit: "1", status: "error" }));
  }

  const contentType = photo instanceof File ? photo.type || "image/jpeg" : null;

  if (contentType && !contentType.startsWith("image/")) {
    redirect(withQuery(returnTo, { submit: "1", status: "error" }));
  }

  const participant = editParticipantId
    ? await (async () => {
        await requireParticipantAccountOwnership(editParticipantId);

        return updateParticipantSubmission({
          id: editParticipantId,
          name,
          gender,
          phone,
          score: Math.round(parsedScore),
          photoData:
            photo instanceof File && photo.size > 0
              ? Buffer.from(await photo.arrayBuffer())
              : undefined,
          photoContentType: contentType ?? undefined,
          photoFileName:
            photo instanceof File && photo.size > 0
              ? safeText(photo.name) || `${name}-score.jpg`
              : undefined,
          accountId,
          ownerToken,
          recoveryCode
        });
      })()
    : await createParticipant({
        name,
        gender,
        phone,
        score: Math.round(parsedScore),
        photoData: Buffer.from(await (photo as File).arrayBuffer()),
        photoContentType: contentType || "image/jpeg",
        photoFileName:
          photo instanceof File ? safeText(photo.name) || `${name}-score.jpg` : `${name}-score.jpg`,
        accountId,
        ownerToken,
        recoveryCode
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
    throw new Error("Ungültiger Score.");
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

export async function deleteOwnedParticipantAction(formData: FormData) {
  const id = safeText(formData.get("id"));
  const returnTo = safeReturnPath(formData.get("returnTo"));

  if (!id) {
    throw new Error("Teilnehmer-ID fehlt.");
  }

  await requireParticipantAccountOwnership(id);
  await deleteParticipant(id);
  revalidatePath("/");
  revalidatePath("/rangliste");
  redirect(returnTo);
}
