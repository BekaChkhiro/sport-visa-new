import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getClubForUser, ageFromBirth } from "@/lib/club";
import { positionLabels, levelLabels } from "@/lib/labels";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubApplicantsContent, type Applicant } from "./ClubApplicantsContent";

export default async function ClubApplicantsPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) {
    return (
      <ClubShell clubName="—" league="—" email={session.email} title="აპლიკანტები">
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6 text-ink-300">ანგარიში არ არის დაკავშირებული კლუბთან.</div>
      </ClubShell>
    );
  }

  const apps = await prisma.trialApplication.findMany({
    where: { trial: { clubId: club.id } },
    orderBy: { matchScore: "desc" },
    include: {
      player: { include: { media: { where: { type: "VIDEO" }, take: 2 } } },
      trial: { select: { title: true } },
    },
  });

  // Dedupe by player, keep highest score
  const seen = new Set<string>();
  const applicants: Applicant[] = [];
  for (const a of apps) {
    if (seen.has(a.playerId)) continue;
    seen.add(a.playerId);
    const p = a.player;
    const posHit = club.positionsNeeded.length === 0 || club.positionsNeeded.includes(p.position);
    const ageHit = club.ageGroups.length === 0 || club.ageGroups.includes(p.ageGroup);
    const cityHit = p.city.trim().toLowerCase() === club.city.trim().toLowerCase();
    applicants.push({
      id: a.id,
      n: 20 + (applicants.length % 40),
      name: `${p.firstName} ${p.lastName}`,
      pos: positionLabels[p.position],
      age: ageFromBirth(p.birthDate),
      city: p.city,
      level: levelLabels[p.level],
      league: p.currentLeague,
      score: a.matchScore,
      date: a.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
      trialTitle: a.trial.title,
      weights: [
        { l: "პოზიცია", v: 40, pct: posHit ? 100 : 0 },
        { l: "ასაკობრივი ჯგუფი", v: 25, pct: ageHit ? 100 : 0 },
        { l: "ქალაქი", v: 20, pct: cityHit ? 100 : 0 },
        { l: "დონე ↔ ლიგა", v: 15, pct: 60 },
      ],
      media: p.media.map((m) => m.url),
    });
  }

  return (
    <ClubShell clubName={club.name} league={club.league} email={session.email} title="აპლიკანტები" subtitle={`${applicants.length} უნიკალური მოთამაშე`}>
      <ClubApplicantsContent applicants={applicants} slots={20} />
    </ClubShell>
  );
}
