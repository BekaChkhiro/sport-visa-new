import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getClubForUser, ageFromBirth } from "@/lib/club";
import { positionLabels, ageGroupLabels, levelLabels } from "@/lib/labels";
import { buildPassport } from "@/lib/passport";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubApplicantDetail, type ApplicantDTO } from "./ClubApplicantDetail";

export default async function ClubApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) notFound();

  const app = await prisma.trialApplication.findFirst({
    where: { id, trial: { clubId: club.id } },
    include: {
      trial: true,
      player: {
        include: {
          media: true,
          user: true,
          positionSkills: { orderBy: { percentage: "desc" } },
          career: { orderBy: { startYear: "desc" } },
          matchLinks: { orderBy: { matchDate: "desc" } },
        },
      },
    },
  });
  if (!app) notFound();

  const p = app.player;
  const posHit = club.positionsNeeded.length === 0 || club.positionsNeeded.includes(p.position);
  const ageHit = club.ageGroups.length === 0 || club.ageGroups.includes(p.ageGroup);
  const cityHit = p.city.trim().toLowerCase() === club.city.trim().toLowerCase();

  const dto: ApplicantDTO = {
    name: `${p.firstName} ${p.lastName}`,
    email: p.user.email,
    position: positionLabels[p.position],
    ageGroup: ageGroupLabels[p.ageGroup],
    age: ageFromBirth(p.birthDate),
    city: p.city,
    level: levelLabels[p.level],
    league: p.currentLeague,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    bio: p.bio,
    photoUrl: p.photoUrl,
    nationality: p.nationality,
    jerseyNumber: p.jerseyNumber,
    passport: buildPassport(p),
    score: app.matchScore,
    trialTitle: app.trial.title,
    appliedDate: app.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }),
    media: p.media.map((m) => ({ id: m.id, url: m.url, type: m.type })),
    weights: [
      { l: "პოზიცია", v: 40, pct: posHit ? 100 : 0 },
      { l: "ასაკობრივი ჯგუფი", v: 25, pct: ageHit ? 100 : 0 },
      { l: "ქალაქი", v: 20, pct: cityHit ? 100 : 0 },
      { l: "დონე ↔ ლიგა", v: 15, pct: 60 },
    ],
  };

  return (
    <ClubShell clubName={club.name} league={club.league} email={session.email} title="აპლიკანტი">
      <ClubApplicantDetail applicant={dto} />
    </ClubShell>
  );
}
