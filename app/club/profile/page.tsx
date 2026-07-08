import { requireUser } from "@/lib/session";
import { getClubForUser } from "@/lib/club";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubProfileForm } from "./ClubProfileForm";

export default async function ClubProfilePage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) {
    return (
      <ClubShell clubName="—" league="—" email={session.email} title="კლუბის პროფილი">
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6 text-ink-300">ანგარიში არ არის დაკავშირებული კლუბთან.</div>
      </ClubShell>
    );
  }

  const trialCount = await (await import("@/lib/prisma")).prisma.trial.count({ where: { clubId: club.id } });

  return (
    <ClubShell clubName={club.name} league={club.league} email={session.email} title="კლუბის პროფილი" subtitle="ეს ინფორმაცია ჩანს მოთამაშეებთან შენს სინჯებში">
      <ClubProfileForm
        defaults={{
          name: club.name,
          city: club.city,
          league: club.league,
          description: club.description ?? "",
          positions: club.positionsNeeded,
          ageGroups: club.ageGroups,
        }}
        trialCount={trialCount}
      />
    </ClubShell>
  );
}
