import type { Position, AgeGroup, Level } from "./generated/prisma/enums";

// Weighted match-score between a player and a club / trial.
// position +40, ageGroup +25, city +20, level↔league +15  →  0–100

export type PlayerMatchInput = {
  position: Position;
  ageGroup: AgeGroup;
  city: string;
  level: Level;
};

export type ClubMatchInput = {
  positionsNeeded: Position[];
  ageGroups: AgeGroup[];
  city: string;
  league: string;
};

const WEIGHTS = { position: 40, ageGroup: 25, city: 20, level: 15 } as const;

// Map a free-text league name to a strength tier (1 = strongest).
export function leagueTier(league: string): number {
  const l = league.toLowerCase();
  if (l.includes("ეროვნული ლიგა 2") || l.includes("erovnuli liga 2")) return 2;
  if (l.includes("ეროვნული") || l.includes("erovnuli") || l.includes("premier"))
    return 1;
  if (l.includes("ლიგა 3") || l.includes("liga 3")) return 3;
  if (l.includes("რეგიონ") || l.includes("region")) return 4;
  if (l.includes("ამატორ") || l.includes("amator")) return 5;
  return 3; // sensible middle default
}

// Map player level to an expected league tier.
export function levelTier(level: Level): number {
  switch (level) {
    case "PRO":
      return 1;
    case "SEMI_PRO":
      return 2;
    case "AMATEUR":
      return 4;
    case "BEGINNER":
      return 5;
    default:
      return 3;
  }
}

function normalizeCity(city: string): string {
  return city.trim().toLowerCase();
}

export function computeMatchScore(
  player: PlayerMatchInput,
  club: ClubMatchInput,
): number {
  let score = 0;

  // Position: club needs this position (empty list = open to any)
  if (
    club.positionsNeeded.length === 0 ||
    club.positionsNeeded.includes(player.position)
  ) {
    score += WEIGHTS.position;
  }

  // Age group fit
  if (club.ageGroups.length === 0 || club.ageGroups.includes(player.ageGroup)) {
    score += WEIGHTS.ageGroup;
  }

  // Same city
  if (normalizeCity(player.city) === normalizeCity(club.city)) {
    score += WEIGHTS.city;
  }

  // Level ↔ league proximity (graded: closer tiers score higher)
  const diff = Math.abs(levelTier(player.level) - leagueTier(club.league));
  score += Math.max(0, WEIGHTS.level - diff * 5);

  return Math.min(100, Math.round(score));
}
