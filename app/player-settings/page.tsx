import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PlayerSettingsScreen } from "./PlayerSettingsScreen";

export default async function PlayerSettingsPage() {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player?.onboarded) redirect("/onboarding");

  return (
    <PlayerSettingsScreen
      firstName={player.firstName}
      lastName={player.lastName}
      email={session.email}
    />
  );
}
