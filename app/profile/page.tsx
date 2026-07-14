import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { positionLabels, ageGroupLabels, levelLabels } from "@/lib/labels";
import { buildPassport } from "@/lib/passport";
import { ProfileScreen, type MediaDTO, type AppDTO } from "./ProfileScreen";

function ageFromBirth(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}

export default async function ProfilePage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
    include: {
      media: { orderBy: { createdAt: "desc" } },
      applications: {
        orderBy: { createdAt: "desc" },
        include: { trial: { include: { club: true } } },
      },
      positionSkills: { orderBy: { percentage: "desc" } },
      career: { orderBy: { startYear: "desc" } },
      matchLinks: { orderBy: { matchDate: "desc" } },
    },
  });
  if (!player?.onboarded) redirect("/onboarding");

  const age = ageFromBirth(player.birthDate);
  const media: MediaDTO[] = player.media.map((m) => ({
    id: m.id,
    type: m.type,
    url: m.url,
    caption: m.caption,
  }));
  const apps: AppDTO[] = player.applications.map((a) => ({
    id: a.id,
    club: a.trial.club.name,
    badge: initials(a.trial.club.name),
    league: a.trial.club.league,
    date: a.trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }),
    score: a.matchScore,
  }));

  const passport = buildPassport(player);

  return (
    <ProfileScreen
      player={{
        firstName: player.firstName,
        lastName: player.lastName,
        email: session.email,
        position: positionLabels[player.position],
        ageGroup: ageGroupLabels[player.ageGroup],
        age,
        city: player.city,
        level: levelLabels[player.level],
        league: player.currentLeague,
        heightCm: player.heightCm,
        weightKg: player.weightKg,
        bio: player.bio,
        photoUrl: player.photoUrl,
        nationality: player.nationality,
        jerseyNumber: player.jerseyNumber,
        completeness: media.length > 0 ? 100 : 80,
      }}
      passport={passport}
      media={media}
      apps={apps}
    />
  );
}
