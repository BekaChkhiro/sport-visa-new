import Link from "next/link";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getClubForUser } from "@/lib/club";
import { positionLabels } from "@/lib/labels";
import { ClubShell } from "@/components/app/ClubShell";
import { Ic } from "@/components/ui/icons";
import { ClubTrialsContent, type TrialRow } from "./ClubTrialsContent";

export default async function ClubTrialsPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) {
    return (
      <ClubShell clubName="—" league="—" email={session.email} title="ჩემი სინჯები">
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6 text-ink-300">ანგარიში არ არის დაკავშირებული კლუბთან.</div>
      </ClubShell>
    );
  }

  const trials = await prisma.trial.findMany({
    where: { clubId: club.id },
    orderBy: { date: "desc" },
    include: {
      applications: { select: { matchScore: true } },
      _count: { select: { applications: true } },
    },
  });

  const rows: TrialRow[] = trials.map((t) => ({
    id: t.id,
    title: t.title,
    date:
      t.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }) +
      ", " +
      t.date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
    place: t.location,
    pos: t.positions.length ? t.positions.map((p) => positionLabels[p]).join(" / ") : "ყველა",
    filled: t._count.applications,
    slots: t.slotsLimit,
    avg: t.applications.length ? Math.round(t.applications.reduce((s, a) => s + a.matchScore, 0) / t.applications.length) : 0,
    status: t.isOpen ? "ღია" : "დასრულებული",
  }));

  return (
    <ClubShell
      clubName={club.name}
      league={club.league}
      email={session.email}
      title="ჩემი სინჯები"
      subtitle="შექმენი, მართე და დახურე სასინჯო ღონისძიებები"
      actions={
        <Link href="/club/trials/new" className="inline-flex h-10 items-center gap-2 rounded-btn bg-brand-400 px-4 text-sm font-semibold text-ink-950 transition-colors hover:bg-brand-300">
          {Ic.plus("h-4 w-4")} ახალი სინჯი
        </Link>
      }
    >
      <ClubTrialsContent trials={rows} />
    </ClubShell>
  );
}
