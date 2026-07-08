import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  saveUpload,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from "@/lib/storage";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "PLAYER") {
    return NextResponse.json({ error: "არაავტორიზებული" }, { status: 401 });
  }

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
    select: { id: true },
  });
  if (!player) {
    return NextResponse.json({ error: "ჯერ შეავსეთ პროფილი" }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "არასწორი მოთხოვნა" }, { status: 400 });
  }

  const file = formData.get("file");
  const caption = (formData.get("caption") as string | null) ?? null;

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "ფაილი არ არის მიმაგრებული" }, { status: 400 });
  }

  const mime = file.type;
  const isImage = ALLOWED_IMAGE_TYPES.includes(mime);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mime);
  if (!isImage && !isVideo) {
    return NextResponse.json(
      { error: "დაუშვებელი ფაილის ტიპი (მხოლოდ ვიდეო ან სურათი)" },
      { status: 400 },
    );
  }

  const maxBytes = isVideo ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return NextResponse.json(
      { error: `ფაილი ძალიან დიდია (მაქს. ${mb}MB)` },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveUpload(buffer, mime);

  const media = await prisma.playerMedia.create({
    data: {
      playerId: player.id,
      type: isVideo ? "VIDEO" : "PHOTO",
      url: saved.url,
      caption: caption?.trim() || null,
    },
  });

  return NextResponse.json({ ok: true, media });
}
