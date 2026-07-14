import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ageGroupLabels } from "@/lib/labels";
import { ProfileEditForm, type MediaItem } from "./ProfileEditForm";

const iso = (d: Date | null) => (d ? d.toISOString().slice(0, 10) : "");

export default async function ProfileEditPage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      media: { orderBy: { createdAt: "desc" } },
      positionSkills: { orderBy: { percentage: "desc" } },
      career: { orderBy: { startYear: "desc" } },
      matchLinks: { orderBy: { matchDate: "desc" } },
    },
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
        // passport
        photoUrl: player.photoUrl,
        nationality: player.nationality,
        school: player.school,
        gradesSheetUrl: player.gradesSheetUrl,
        contractDocUrl: player.contractDocUrl,
        sprint10m: player.sprint10m,
        sprint30m: player.sprint30m,
        activeSeason: player.activeSeason,
        currentTeam: player.currentTeam,
        contractStart: iso(player.contractStart),
        contractEnd: iso(player.contractEnd),
        jerseyNumber: player.jerseyNumber,
        preferredFoot: player.preferredFoot,
        rightFootPct: player.rightFootPct,
        leftFootPct: player.leftFootPct,
        positionSkills: player.positionSkills.map((s) => ({ position: s.position, percentage: s.percentage })),
        career: player.career.map((c) => ({
          teamName: c.teamName,
          startYear: String(c.startYear),
          endYear: c.endYear != null ? String(c.endYear) : "",
          position: c.position ?? "",
          jersey: c.jerseyNumber != null ? String(c.jerseyNumber) : "",
        })),
        matchLinks: player.matchLinks.map((m) => ({
          url: m.url,
          matchDate: iso(m.matchDate),
          opponent: m.opponent ?? "",
          competition: m.competition ?? "",
        })),
      }}
      media={media}
    />
  );
}

export const dynamic = "force-dynamic";
