import { NextResponse } from "next/server";

import { isAdminAuthenticated } from "@/lib/auth";
import { getParticipantPhotoById } from "@/lib/participants";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return new NextResponse("Nicht autorisiert.", { status: 401 });
  }

  const { id } = await params;
  const photo = await getParticipantPhotoById(id);

  if (!photo) {
    return new NextResponse("Nicht gefunden.", { status: 404 });
  }

  const contentType = photo.photo_content_type;
  const photoData = photo.photo_data;

  return new NextResponse(new Uint8Array(photoData), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600"
    }
  });
}
