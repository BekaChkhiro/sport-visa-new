import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ageGroupLabels } from "@/lib/labels";
import { ProfileEditForm, type MediaItem } from "./ProfileEditForm";

export default async function ProfileEditPage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
    include: { media: { orderBy: { createdAt: "desc" } } },
  });
  if (!player?.onboarded) redirect("/onboarding");

  const media: MediaItem[] = player.media.map((m) => ({ id: m.id, url: m.url, type: m.type }));

  return (
    <ProfileEditForm
      email={session.email}
      defaults={{
        firstName: player.firstName,
        lastName: player.lastName,
        birthDate: player.birthDate.toISOString().slice(0, 10),
        position: player.position,
        city: player.city,
        level: player.level,
        currentLeague: player.currentLeague,
        heightCm: player.heightCm,
        weightKg: player.weightKg,
        bio: player.bio,
        ageGroup: ageGroupLabels[player.ageGroup],
      }}
      media={media}
    />
  );
}

export const dynamic = "force-dynamic";
