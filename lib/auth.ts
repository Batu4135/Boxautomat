import "server-only";

import { cookies } from "next/headers";

import { getAdminPassword } from "@/lib/env";

const ADMIN_COOKIE = "boxautomat-admin";
const PARTICIPANT_COOKIE = "boxautomat-participant";
const OWNED_PARTICIPANTS_COOKIE = "boxautomat-owned";

async function setOwnedParticipantsCookie(participantIds: string[]) {
  const cookieStore = await cookies();

  cookieStore.set(OWNED_PARTICIPANTS_COOKIE, participantIds.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_COOKIE)?.value === getAdminPassword();
}

export async function requireAdmin() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    throw new Error("Nicht autorisiert.");
  }
}

export async function setAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, getAdminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
}

export async function setParticipantSession(participantId: string) {
  const cookieStore = await cookies();

  cookieStore.set(PARTICIPANT_COOKIE, participantId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14
  });
}

export async function addOwnedParticipant(participantId: string) {
  const cookieStore = await cookies();
  const existingValue = cookieStore.get(OWNED_PARTICIPANTS_COOKIE)?.value ?? "";
  const nextIds = Array.from(
    new Set(
      existingValue
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
        .concat(participantId)
    )
  );

  await setOwnedParticipantsCookie(nextIds);
}

export async function getParticipantSession() {
  const cookieStore = await cookies();
  return cookieStore.get(PARTICIPANT_COOKIE)?.value ?? null;
}

export async function getOwnedParticipantIds() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(OWNED_PARTICIPANTS_COOKIE)?.value ?? "";

  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function requireOwnedParticipant(participantId: string) {
  const ownedIds = await getOwnedParticipantIds();

  if (!ownedIds.includes(participantId)) {
    throw new Error("Nicht autorisiert.");
  }
}

export async function removeOwnedParticipant(participantId: string) {
  const ownedIds = (await getOwnedParticipantIds()).filter((id) => id !== participantId);

  await setOwnedParticipantsCookie(ownedIds);

  if ((await getParticipantSession()) === participantId) {
    if (ownedIds[0]) {
      await setParticipantSession(ownedIds[0]);
    } else {
      await clearParticipantSession();
    }
  }
}

export async function clearParticipantSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PARTICIPANT_COOKIE);
}

export async function setOwnedParticipants(participantIds: string[]) {
  const uniqueIds = Array.from(new Set(participantIds.filter(Boolean)));

  await setOwnedParticipantsCookie(uniqueIds);

  if (uniqueIds[0]) {
    await setParticipantSession(uniqueIds[0]);
  } else {
    await clearParticipantSession();
  }
}
