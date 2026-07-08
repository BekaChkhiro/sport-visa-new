import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/app/AdminShell";
import { Ic } from "@/components/ui/icons";
import { AdminDashboardContent, type TopClub, type ActivityItem } from "./AdminDashboardContent";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}
const TONES = ["brand", "accent", "iris", "flame", "warning"];

export default async function AdminDashboardPage() {
  const session = await requireUser(["ADMIN"]);

  const [playerCount, clubCount, openTrials, totalApps, clubs, recentPlayers, recentApps] = await Promise.all([
    prisma.playerProfile.count(),
    prisma.club.count(),
    prisma.trial.count({ where: { isOpen: true } }),
    prisma.trialApplication.count(),
    prisma.club.findMany({
      include: { _count: { select: { trials: true } }, trials: { select: { _count: { select: { applications: true } } } } },
    }),
    prisma.playerProfile.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
    prisma.trialApplication.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { player: true, trial: { include: { club: true } } } }),
  ]);

  const withApps = clubs
    .map((c) => ({ name: c.name, league: c.league, apps: c.trials.reduce((s, t) => s + t._count.applications, 0) }))
    .sort((a, b) => b.apps - a.apps);

  const topClubs: TopClub[] = withApps.slice(0, 5).map((c, i) => ({
    n: initials(c.name),
    name: c.name,
    league: c.league,
    apps: c.apps,
    tone: TONES[i % TONES.length],
  }));

  const activity: ActivityItem[] = [
    ...recentPlayers.map((p) => ({ t: `${p.firstName} ${p.lastName}მ დაასრულა ონბორდინგი`, ts: "ბოლო ხანს", tone: "brand" as const })),
    ...recentApps.map((a) => ({ t: `${a.player.firstName}მ გააგზავნა განაცხადი — ${a.trial.club.name}`, ts: "ბოლო ხანს", tone: "accent" as const })),
  ].slice(0, 6);

  return (
    <AdminShell
      email={session.email}
      title="მიმოხილვა"
      subtitle="პლატფორმის საერთო მდგომარეობა"
      actions={
        <Link href="/admin/clubs" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">
          {Ic.plus("h-4 w-4")} ახალი კლუბი
        </Link>
      }
    >
      <AdminDashboardContent
        kpis={{ players: playerCount, clubs: clubCount, openTrials, apps: totalApps }}
        chart={withApps.slice(0, 7).map((c) => ({ m: initials(c.name), v: c.apps }))}
        topClubs={topClubs}
        activity={activity}
      />
    </AdminShell>
  );
}
