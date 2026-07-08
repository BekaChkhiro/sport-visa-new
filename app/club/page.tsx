import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { positionLabels } from "@/lib/labels";
import { getClubForUser, ageFromBirth } from "@/lib/club";
import { ClubShell } from "@/components/app/ClubShell";
import { Ic } from "@/components/ui/icons";
import { ClubDashboardContent, type ClubTrialRow, type RecentApplicant } from "./ClubDashboardContent";

export default async function ClubDashboardPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) {
    return (
      <ClubShell clubName="—" league="—" email={session.email} title="მთავარი">
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6 text-ink-300">
          თქვენი ანგარიში ჯერ არ არის დაკავშირებული კლუბთან. დაუკავშირდით ადმინისტრატორს.
        </div>
      </ClubShell>
    );
  }

  const trials = await prisma.trial.findMany({
    where: { clubId: club.id },
    orderBy: { date: "asc" },
    include: {
      applications: { select: { matchScore: true } },
      _count: { select: { applications: true } },
    },
  });

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  const [totalApplicants, newApplicants, recent] = await Promise.all([
    prisma.trialApplication.count({ where: { trial: { clubId: club.id } } }),
    prisma.trialApplication.count({ where: { trial: { clubId: club.id }, createdAt: { gte: weekAgo } } }),
    prisma.trialApplication.findMany({
      where: { trial: { clubId: club.id } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { player: true },
    }),
  ]);

  const rows: ClubTrialRow[] = trials.map((t) => {
    const avg = t.applications.length
      ? Math.round(t.applications.reduce((s, a) => s + a.matchScore, 0) / t.applications.length)
      : 0;
    return {
      id: t.id,
      title: t.title,
      date: t.date.toLocaleDateString("ka-GE", { day: "numeric", month: "long" }),
      pos: t.positions.length ? t.positions.map((p) => positionLabels[p]).join(" / ") : "ყველა",
      filled: t._count.applications,
      slots: t.slotsLimit,
      avg,
      status: t.isOpen ? "ღია" : "დასრულებული",
    };
  });

  const recentDTO: RecentApplicant[] = recent.map((a, i) => ({
    id: a.id,
    n: 20 + i * 7,
    name: `${a.player.firstName} ${a.player.lastName}`,
    pos: `${positionLabels[a.player.position]} · ${ageFromBirth(a.player.birthDate)}`,
    score: a.matchScore,
  }));

  const openCount = trials.filter((t) => t.isOpen).length;
  const avgMatch = (() => {
    const openApps = trials.filter((t) => t.isOpen).flatMap((t) => t.applications);
    return openApps.length ? Math.round(openApps.reduce((s, a) => s + a.matchScore, 0) / openApps.length) : 0;
  })();

  return (
    <ClubShell
      clubName={club.name}
      league={club.league}
      email={session.email}
      title="მთავარი"
      subtitle="კლუბის საერთო მიმოხილვა"
      actions={
        <Link href="/club/trials/new" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">
          {Ic.plus("h-4 w-4")} ახალი სინჯი
        </Link>
      }
    >
      <ClubDashboardContent
        kpis={{
          activeTrials: trials.length,
          activeSub: `${openCount} ღია`,
          totalApplicants,
          newApplicants,
          avgMatch,
        }}
        trials={rows}
        recent={recentDTO}
      />
    </ClubShell>
  );
}
