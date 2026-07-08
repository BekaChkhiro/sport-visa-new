import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminClubsContent, type ClubRow } from "./AdminClubsContent";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}
const TONES = ["brand", "accent", "iris", "flame"];

export default async function AdminClubsPage() {
  const session = await requireUser(["ADMIN"]);

  const clubs = await prisma.club.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      members: { include: { user: true } },
      _count: { select: { trials: true } },
      trials: { select: { _count: { select: { applications: true } } } },
    },
  });

  const rows: ClubRow[] = clubs.map((c, i) => ({
    id: c.id,
    n: initials(c.name),
    name: c.name,
    league: c.league,
    city: c.city,
    trials: c._count.trials,
    apps: c.trials.reduce((s, t) => s + t._count.applications, 0),
    status: c.acceptingTrials ? "აქტიური" : "შეჩერებული",
    created: c.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
    manager: c.members[0]?.user.email ?? "—",
    tone: TONES[i % TONES.length],
  }));

  return (
    <AdminShell email={session.email} title="კლუბები" subtitle="კლუბის ანგარიშებს ქმნის და მართავს ადმინი">
      <AdminClubsContent clubs={rows} />
    </AdminShell>
  );
}
