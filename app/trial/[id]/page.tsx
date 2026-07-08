import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { computeMatchScore, leagueTier, levelTier } from "@/lib/matching";
import { positionLabels, ageGroupLabels } from "@/lib/labels";
import { TrialDetailScreen, type WeightRow } from "./TrialDetailScreen";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}

export default async function TrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player?.onboarded) notFound();

  const trial = await prisma.trial.findUnique({
    where: { id },
    include: {
      club: true,
      _count: { select: { applications: true } },
      applications: { where: { playerId: player.id }, select: { id: true } },
    },
  });
  if (!trial) notFound();

  const club = trial.club;
  const score = computeMatchScore(
    { position: player.position, ageGroup: player.ageGroup, city: player.city, level: player.level },
    { positionsNeeded: club.positionsNeeded, ageGroups: club.ageGroups, city: club.city, league: club.league },
  );

  const posHit = club.positionsNeeded.length === 0 || club.positionsNeeded.includes(player.position);
  const ageHit = club.ageGroups.length === 0 || club.ageGroups.includes(player.ageGroup);
  const cityHit = player.city.trim().toLowerCase() === club.city.trim().toLowerCase();
  const levelVal = Math.max(0, 15 - Math.abs(levelTier(player.level) - leagueTier(club.league)) * 5);

  const weights: WeightRow[] = [
    { label: "პოზიცია", value: 40, pct: posHit ? 100 : 0, hit: posHit },
    { label: "ასაკობრივი ჯგუფი", value: 25, pct: ageHit ? 100 : 0, hit: ageHit },
    { label: "ქალაქი", value: 20, pct: cityHit ? 100 : 0, hit: cityHit },
    { label: "დონე ↔ ლიგა", value: 15, pct: Math.round((levelVal / 15) * 100), hit: levelVal > 0 },
  ];

  return (
    <TrialDetailScreen
      email={session.email}
      trial={{
        id: trial.id,
        club: club.name,
        badge: initials(club.name),
        league: club.league,
        title: trial.title,
        date: trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }) +
          ", " + trial.date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
        shortDate: trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }),
        place: trial.location,
        criteria: trial.criteria,
        filled: trial._count.applications,
        slots: trial.slotsLimit,
        score,
        isOpen: trial.isOpen && club.acceptingTrials,
        applied: trial.applications.length > 0,
        positions: club.positionsNeeded.map((p) => positionLabels[p]),
        ageGroups: club.ageGroups.map((g) => ageGroupLabels[g]),
      }}
      weights={weights}
    />
  );
}
