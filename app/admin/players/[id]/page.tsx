import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ageFromBirth } from "@/lib/club";
import { positionLabels, levelLabels, ageGroupLabels } from "@/lib/labels";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminPlayerDetail, type PlayerDetailDTO } from "./AdminPlayerDetail";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}
const TONES = ["brand", "accent", "iris", "flame"];

export default async function AdminPlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(["ADMIN"]);

  const player = await prisma.playerProfile.findUnique({
    where: { id },
    include: {
      user: true,
      media: true,
      applications: { orderBy: { createdAt: "desc" }, include: { trial: { include: { club: true } } } },
    },
  });
  if (!player) notFound();

  const clubTone = new Map<string, string>();
  let ti = 0;

  const dto: PlayerDetailDTO = {
    name: `${player.firstName} ${player.lastName}`,
    email: player.user.email,
    position: positionLabels[player.position],
    ageGroup: ageGroupLabels[player.ageGroup],
    age: ageFromBirth(player.birthDate),
    city: player.city,
    level: levelLabels[player.level],
    league: player.currentLeague,
    heightCm: player.heightCm,
    weightKg: player.weightKg,
    completeness: player.media.length > 0 ? 100 : 80,
    registered: player.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "short", year: "numeric" }),
    apps: player.applications.map((a) => {
      if (!clubTone.has(a.trial.clubId)) clubTone.set(a.trial.clubId, TONES[ti++ % TONES.length]);
      return {
        id: a.id,
        club: a.trial.club.name,
        badge: initials(a.trial.club.name),
        ct: clubTone.get(a.trial.clubId)!,
        trial: a.trial.title,
        date: a.createdAt.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }),
        status: a.trial.date.getTime() >= Date.now() ? "გაგზავნილი" : "გასული",
      };
    }),
    media: player.media.map((m) => ({ id: m.id, url: m.url, type: m.type })),
  };

  return (
    <AdminShell email={session.email} title="მოთამაშის დეტალი">
      <AdminPlayerDetail player={dto} />
    </AdminShell>
  );
}
