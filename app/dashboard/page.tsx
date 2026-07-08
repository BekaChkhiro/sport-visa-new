import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecommendedTrials } from "@/lib/recommendations";
import { positionLabels, levelLabels } from "@/lib/labels";
import { DashboardScreen, type TrialDTO } from "./DashboardScreen";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
}

function formatDateTime(d: Date): string {
  const day = d.toLocaleDateString("ka-GE", { day: "numeric", month: "long" });
  const time = d.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" });
  return `${day}, ${time}`;
}

export default async function DashboardPage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
    include: { _count: { select: { media: true } } },
  });
  if (!player?.onboarded) redirect("/onboarding");

  const recs = await getRecommendedTrials(player);

  const trials: TrialDTO[] = recs.map((t) => ({
    id: t.trialId,
    club: t.clubName,
    badge: initials(t.clubName),
    league: t.clubLeague,
    title: t.title,
    date: formatDateTime(t.date),
    place: t.location,
    filled: t.applicantCount,
    slots: t.slotsLimit,
    score: t.matchScore,
    applied: t.alreadyApplied,
    positions: t.positions.map((p) => positionLabels[p]),
  }));

  const hasMedia = player._count.media > 0;
  const completeness = hasMedia ? 100 : 80;

  return (
    <DashboardScreen
      player={{
        firstName: player.firstName,
        position: positionLabels[player.position],
        city: player.city,
        level: levelLabels[player.level],
        league: player.currentLeague,
        completeness,
        hasMedia,
      }}
      trials={trials}
      openTrialCount={trials.length}
    />
  );
}
