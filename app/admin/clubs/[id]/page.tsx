import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { positionLabels, ageGroupLabels } from "@/lib/labels";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminClubDetail, type ClubDetailDTO } from "./AdminClubDetail";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}

export default async function AdminClubDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["ADMIN"]);

  const club = await prisma.club.findUnique({
    where: { id },
    include: {
      members: { include: { user: true } },
      trials: {
        orderBy: { date: "desc" },
        include: { applications: { select: { matchScore: true } }, _count: { select: { applications: true } } },
      },
    },
  });
  if (!club) notFound();

  const totalApplicants = club.trials.reduce((s, t) => s + t._count.applications, 0);
  const openApps = club.trials.filter((t) => t.isOpen).flatMap((t) => t.applications);
  const avg = openApps.length ? Math.round(openApps.reduce((s, a) => s + a.matchScore, 0) / openApps.length) : 0;

  const dto: ClubDetailDTO = {
    id: club.id,
    name: club.name,
    badge: initials(club.name),
    league: club.league,
    city: club.city,
    accepting: club.acceptingTrials,
    created: club.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "long", year: "numeric" }),
    manager: club.members[0]?.user.email ?? "—",
    positions: club.positionsNeeded.map((p) => positionLabels[p]),
    ageGroups: club.ageGroups.map((g) => ageGroupLabels[g]),
    kpis: { trials: club.trials.length, open: club.trials.filter((t) => t.isOpen).length, applicants: totalApplicants, avg, team: club.members.length },
    trials: club.trials.map((t) => ({
      id: t.id,
      title: t.title,
      date: t.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
      filled: t._count.applications,
      slots: t.slotsLimit,
      status: t.isOpen ? "ღია" : "დასრულებული",
    })),
    team: club.members.map((m, i) => ({
      n: 33 + i * 14,
      name: m.user.email.split("@")[0],
      email: m.user.email,
      role: i === 0 ? "მთავარი ადმინი" : "წევრი",
    })),
  };

  return (
    <AdminShell email={session.email} title="კლუბის დეტალი">
      <AdminClubDetail club={dto} />
    </AdminShell>
  );
}
