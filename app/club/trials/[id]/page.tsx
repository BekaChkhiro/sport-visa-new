import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getClubForUser, ageFromBirth } from "@/lib/club";
import { positionLabels, ageGroupLabels } from "@/lib/labels";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubTrialDetailContent, type TopApplicant } from "./ClubTrialDetailContent";

export default async function ClubTrialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) notFound();

  const trial = await prisma.trial.findFirst({
    where: { id, clubId: club.id },
    include: {
      applications: {
        orderBy: { matchScore: "desc" },
        include: { player: true },
      },
    },
  });
  if (!trial) notFound();

  const filled = trial.applications.length;
  const fill = Math.min(100, Math.round((filled / trial.slotsLimit) * 100));
  const avg = filled ? Math.round(trial.applications.reduce((s, a) => s + a.matchScore, 0) / filled) : 0;
  const daysLeft = Math.max(0, Math.ceil((trial.date.getTime() - Date.now()) / (24 * 3600 * 1000)));

  const top: TopApplicant[] = trial.applications.slice(0, 6).map((a, i) => ({
    id: a.id,
    n: 20 + i * 6,
    name: `${a.player.firstName} ${a.player.lastName}`,
    pos: `${positionLabels[a.player.position]} · ${ageFromBirth(a.player.birthDate)}`,
    score: a.matchScore,
  }));

  return (
    <ClubShell clubName={club.name} league={club.league} email={session.email} title="სინჯის დეტალი">
      <ClubTrialDetailContent
        trial={{
          id: trial.id,
          title: trial.title,
          isOpen: trial.isOpen,
          published: trial.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }),
          dateTime:
            trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }) +
            ", " + trial.date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
          shortDate: trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
          place: trial.location,
          criteria: trial.criteria,
          slots: trial.slotsLimit,
          filled,
          fill,
          avg,
          daysLeft,
          positions: trial.positions.map((p) => positionLabels[p]),
          ageGroups: trial.ageGroups.map((g) => ageGroupLabels[g]),
        }}
        top={top}
      />
    </ClubShell>
  );
}
