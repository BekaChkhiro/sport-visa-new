import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ageFromBirth } from "@/lib/club";
import { positionLabels, levelLabels } from "@/lib/labels";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminPlayersContent, type PlayerRow } from "./AdminPlayersContent";

export default async function AdminPlayersPage() {
  const session = await requireUser(["ADMIN"]);

  const players = await prisma.playerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true, media: true } },
    },
  });

  const rows: PlayerRow[] = players.map((p, i) => ({
    n: 20 + (i % 40),
    name: `${p.firstName} ${p.lastName}`,
    pos: positionLabels[p.position],
    age: ageFromBirth(p.birthDate),
    city: p.city,
    level: levelLabels[p.level],
    done: p._count.media > 0 ? 100 : 80,
    apps: p._count.applications,
    status: "აქტიური",
    joined: p.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
  }));

  return (
    <AdminShell email={session.email} title="მოთამაშეები" subtitle={`${players.length} რეგისტრირებული მოთამაშე`}>
      <AdminPlayersContent players={rows} />
    </AdminShell>
  );
}
