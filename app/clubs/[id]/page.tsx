import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeMatchScore } from "@/lib/matching";
import { positionLabels, ageGroupLabels } from "@/lib/labels";
import { ClubPublicScreen, type PublicTrial } from "./ClubPublicScreen";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}

export default async function ClubPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      trials: {
        where: { isOpen: true },
        orderBy: { date: "asc" },
        include: {
          _count: { select: { applications: true } },
          applications: player ? { where: { playerId: player.id }, select: { id: true } } : false,
        },
      },
      _count: { select: { trials: true } },
    },
  });
  if (!club) notFound();

  const totalApplicants = await prisma.trialApplication.count({
    where: { trial: { clubId: club.id } },
  });

  const trials: PublicTrial[] = club.trials.map((t) => ({
    id: t.id,
    title: t.title,
    date:
      t.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }) +
      ", " +
      t.date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
    place: t.location,
    filled: t._count.applications,
    slots: t.slotsLimit,
    score: player
      ? computeMatchScore(
          { position: player.position, ageGroup: player.ageGroup, city: player.city, level: player.level },
          { positionsNeeded: club.positionsNeeded, ageGroups: club.ageGroups, city: club.city, league: club.league },
        )
      : 0,
    applied: Array.isArray(t.applications) && t.applications.length > 0,
  }));

  return (
    <ClubPublicScreen
      email={session.email}
      club={{
        name: club.name,
        badge: initials(club.name),
        league: club.league,
        city: club.city,
        description: club.description,
        acceptingTrials: club.acceptingTrials,
        positions: club.positionsNeeded.map((p) => positionLabels[p]),
        ageGroups: club.ageGroups.map((g) => ageGroupLabels[g]),
        totalApplicants,
      }}
      trials={trials}
    />
  );
}
