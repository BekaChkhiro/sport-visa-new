import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminTrialsContent, type AdminTrialRow } from "./AdminTrialsContent";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}
const TONES = ["brand", "accent", "iris", "flame"];

export default async function AdminTrialsPage() {
  const session = await requireUser(["ADMIN"]);

  const trials = await prisma.trial.findMany({
    orderBy: { date: "desc" },
    include: {
      club: true,
      applications: { select: { matchScore: true } },
      _count: { select: { applications: true } },
    },
  });

  const clubTone = new Map<string, string>();
  let ti = 0;

  const rows: AdminTrialRow[] = trials.map((t) => {
    if (!clubTone.has(t.clubId)) clubTone.set(t.clubId, TONES[ti++ % TONES.length]);
    return {
      id: t.id,
      title: t.title,
      club: t.club.name,
      cn: initials(t.club.name),
      ct: clubTone.get(t.clubId)!,
      date: t.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
      filled: t._count.applications,
      slots: t.slotsLimit,
      avg: t.applications.length ? Math.round(t.applications.reduce((s, a) => s + a.matchScore, 0) / t.applications.length) : 0,
      status: t.isOpen ? "ღია" : "დასრულებული",
    };
  });

  return (
    <AdminShell email={session.email} title="სინჯები" subtitle="ყველა კლუბის სასინჯო ღონისძიება ერთ ადგილას">
      <AdminTrialsContent trials={rows} />
    </AdminShell>
  );
}
