import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OnboardingScreen } from "./OnboardingScreen";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ first?: string; last?: string }>;
}) {
  const session = await requireUser(["PLAYER"]);
  const sp = await searchParams;
  const profile = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });

  return (
    <OnboardingScreen
      defaults={{
        firstName: profile?.firstName ?? sp.first ?? "",
        lastName: profile?.lastName ?? sp.last ?? "",
        birthDate: profile?.birthDate
          ? profile.birthDate.toISOString().slice(0, 10)
          : "",
        position: profile?.position,
        city: profile?.city,
        level: profile?.level,
        currentLeague: profile?.currentLeague,
      }}
    />
  );
}
