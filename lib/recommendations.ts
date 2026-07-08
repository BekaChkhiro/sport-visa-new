import "server-only";
import { prisma } from "./prisma";
import { computeMatchScore } from "./matching";
import type { PlayerProfile } from "./generated/prisma/client";
import type { Position } from "./generated/prisma/enums";

export type RecommendedTrial = {
  trialId: string;
  clubId: string;
  clubName: string;
  clubCity: string;
  clubLeague: string;
  title: string;
  date: Date;
  location: string;
  slotsLimit: number;
  applicantCount: number;
  matchScore: number;
  alreadyApplied: boolean;
  positions: Position[];
};

// Open trials from accepting clubs, scored & sorted for a given player.
export async function getRecommendedTrials(
  player: PlayerProfile,
): Promise<RecommendedTrial[]> {
  const trials = await prisma.trial.findMany({
    where: {
      isOpen: true,
      club: { acceptingTrials: true },
    },
    include: {
      club: true,
      _count: { select: { applications: true } },
      applications: { where: { playerId: player.id }, select: { id: true } },
    },
  });

  const scored = trials.map((t) => {
    const matchScore = computeMatchScore(
      {
        position: player.position,
        ageGroup: player.ageGroup,
        city: player.city,
        level: player.level,
      },
      {
        positionsNeeded: t.club.positionsNeeded,
        ageGroups: t.club.ageGroups,
        city: t.club.city,
        league: t.club.league,
      },
    );
    return {
      trialId: t.id,
      clubId: t.clubId,
      clubName: t.club.name,
      clubCity: t.club.city,
      clubLeague: t.club.league,
      title: t.title,
      date: t.date,
      location: t.location,
      slotsLimit: t.slotsLimit,
      applicantCount: t._count.applications,
      matchScore,
      alreadyApplied: t.applications.length > 0,
      positions: t.positions,
    };
  });

  return scored.sort((a, b) => b.matchScore - a.matchScore);
}
