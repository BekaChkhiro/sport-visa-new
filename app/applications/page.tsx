import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ApplicationsScreen, type AppItem } from "./ApplicationsScreen";

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((w) => w[0] ?? "").join("");
}
const TONES = ["brand", "accent", "iris", "flame"];

export default async function ApplicationsPage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({ where: { userId: session.userId } });
  if (!player?.onboarded) redirect("/onboarding");

  const apps = await prisma.trialApplication.findMany({
    where: { playerId: player.id },
    orderBy: { createdAt: "desc" },
    include: { trial: { include: { club: true } } },
  });

  const now = Date.now();
  const clubTone = new Map<string, string>();
  let ti = 0;

  const items: AppItem[] = apps.map((a) => {
    if (!clubTone.has(a.trial.clubId)) clubTone.set(a.trial.clubId, TONES[ti++ % TONES.length]);
    const future = a.trial.date.getTime() >= now && a.trial.isOpen;
    return {
      id: a.id,
      trialId: a.trialId,
      club: a.trial.club.name,
      badge: initials(a.trial.club.name),
      ct: clubTone.get(a.trial.clubId)!,
      league: a.trial.club.league,
      title: a.trial.title,
      date:
        a.trial.date.toLocaleDateString("ka-GE", { day: "numeric", month: "short" }) +
        ", " + a.trial.date.toLocaleTimeString("ka-GE", { hour: "2-digit", minute: "2-digit" }),
      place: a.trial.location,
      score: a.matchScore,
      group: future ? "აქტიური" : "წარსული",
      status: future ? "გაგზავნილი" : "გასული",
    };
  });

  const active = items.filter((i) => i.group === "აქტიური").length;
  const avg = items.length ? Math.round(items.reduce((s, i) => s + i.score, 0) / items.length) : 0;

  return (
    <ApplicationsScreen
      email={session.email}
      firstName={player.firstName}
      items={items}
      summary={{ total: items.length, active, past: items.length - active, avg }}
    />
  );
}
