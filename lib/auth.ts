import "server-only";

import { cookies } from "next/headers";

import { getAdminPassword } from "@/lib/env";

const ADMIN_COOKIE = "boxautomat-admin";
const PARTICIPANT_COOKIE = "boxautomat-participant";

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

export async function getParticipantSession() {
  const cookieStore = await cookies();
  return cookieStore.get(PARTICIPANT_COOKIE)?.value ?? null;
}

export async function clearParticipantSession() {
  const cookieStore = await cookies();
  cookieStore.delete(PARTICIPANT_COOKIE);
}
