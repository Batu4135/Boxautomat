import { NextResponse } from "next/server";

import { getOwnedParticipantIds, setOwnedParticipants } from "@/lib/auth";
import {
  assignOwnershipToParticipants,
  getParticipantsByOwnerToken
} from "@/lib/participants";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const ownerToken =
    typeof body?.ownerToken === "string" ? body.ownerToken.trim() : "";
  const recoveryCode =
    typeof body?.recoveryCode === "string" ? body.recoveryCode.trim() : "";

  if (!ownerToken) {
    return NextResponse.json({ restored: false, count: 0 }, { status: 400 });
  }

  let participants = await getParticipantsByOwnerToken(ownerToken);
  const currentOwnedIds = await getOwnedParticipantIds();

  if (participants.length === 0 && currentOwnedIds.length > 0) {
    await assignOwnershipToParticipants(currentOwnedIds, ownerToken, recoveryCode);
    participants = await getParticipantsByOwnerToken(ownerToken);
  }

  if (participants.length === 0) {
    return NextResponse.json({ restored: false, count: 0 });
  }

  const participantIds = participants.map((participant) => participant.id);
  const alreadySynced =
    currentOwnedIds.length === participantIds.length &&
    currentOwnedIds.every((id) => participantIds.includes(id));

  if (!alreadySynced) {
    await setOwnedParticipants(participantIds);
  }

  return NextResponse.json({
    restored: !alreadySynced,
    count: participants.length
  });
}
