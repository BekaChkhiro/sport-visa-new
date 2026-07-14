// Maps a PlayerProfile (with passport relations) to a display DTO,
// shared by the player profile page and the club applicant view.
import { positionLabels } from "./labels";
import type { Position, Foot } from "./generated/prisma/enums";

const footLabels: Record<Foot, string> = {
  RIGHT: "მარჯვენა",
  LEFT: "მარცხენა",
  BOTH: "ორივე",
};

export type SkillDTO = { position: string; percentage: number };
export type CareerDTO = {
  teamName: string;
  years: string;
  position: string | null;
  jerseyNumber: number | null;
};
export type MatchLinkDTO = {
  url: string;
  date: string | null;
  opponent: string | null;
  competition: string | null;
};

export type PassportDTO = {
  photoUrl: string | null;
  nationality: string | null;
  jerseyNumber: number | null;
  preferredFoot: string | null;
  rightFootPct: number | null;
  leftFootPct: number | null;
  sprint10m: number | null;
  sprint30m: number | null;
  currentTeam: string | null;
  activeSeason: string | null;
  contractStart: string | null;
  contractEnd: string | null;
  school: string | null;
  gradesSheetUrl: string | null;
  contractDocUrl: string | null;
  skills: SkillDTO[];
  career: CareerDTO[];
  matchLinks: MatchLinkDTO[];
};

type PlayerWithPassport = {
  photoUrl: string | null;
  nationality: string | null;
  jerseyNumber: number | null;
  preferredFoot: Foot | null;
  rightFootPct: number | null;
  leftFootPct: number | null;
  sprint10m: number | null;
  sprint30m: number | null;
  currentTeam: string | null;
  activeSeason: string | null;
  contractStart: Date | null;
  contractEnd: Date | null;
  school: string | null;
  gradesSheetUrl: string | null;
  contractDocUrl: string | null;
  positionSkills: { position: Position; percentage: number }[];
  career: {
    teamName: string;
    startYear: number;
    endYear: number | null;
    position: Position | null;
    jerseyNumber: number | null;
  }[];
  matchLinks: {
    url: string;
    matchDate: Date | null;
    opponent: string | null;
    competition: string | null;
  }[];
};

const fmtDate = (d: Date | null) =>
  d
    ? d.toLocaleDateString("ka-GE", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

export function buildPassport(p: PlayerWithPassport): PassportDTO {
  return {
    photoUrl: p.photoUrl,
    nationality: p.nationality,
    jerseyNumber: p.jerseyNumber,
    preferredFoot: p.preferredFoot ? footLabels[p.preferredFoot] : null,
    rightFootPct: p.rightFootPct,
    leftFootPct: p.leftFootPct,
    sprint10m: p.sprint10m,
    sprint30m: p.sprint30m,
    currentTeam: p.currentTeam,
    activeSeason: p.activeSeason,
    contractStart: fmtDate(p.contractStart),
    contractEnd: fmtDate(p.contractEnd),
    school: p.school,
    gradesSheetUrl: p.gradesSheetUrl,
    contractDocUrl: p.contractDocUrl,
    skills: p.positionSkills.map((s) => ({
      position: positionLabels[s.position],
      percentage: s.percentage,
    })),
    career: p.career.map((c) => ({
      teamName: c.teamName,
      years: c.endYear ? `${c.startYear}–${c.endYear}` : `${c.startYear}–ახლა`,
      position: c.position ? positionLabels[c.position] : null,
      jerseyNumber: c.jerseyNumber,
    })),
    matchLinks: p.matchLinks.map((m) => ({
      url: m.url,
      date: fmtDate(m.matchDate),
      opponent: m.opponent,
      competition: m.competition,
    })),
  };
}

// Which passport sections actually have data — for conditional rendering.
export function hasPassportDetail(p: PassportDTO): boolean {
  return Boolean(
    p.sprint10m ||
      p.sprint30m ||
      p.preferredFoot ||
      p.skills.length ||
      p.currentTeam ||
      p.activeSeason ||
      p.contractStart ||
      p.contractEnd ||
      p.school ||
      p.gradesSheetUrl ||
      p.contractDocUrl ||
      p.career.length ||
      p.matchLinks.length,
  );
}
