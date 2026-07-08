import { requireUser } from "@/lib/session";
import { getClubForUser } from "@/lib/club";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubTrialNewForm } from "./ClubTrialNewForm";

export default async function ClubTrialNewPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  if (!club) {
    return (
      <ClubShell clubName="—" league="—" email={session.email} title="ახალი სინჯი">
        <div className="rounded-card border border-ink-800 bg-ink-900 p-6 text-ink-300">ანგარიში არ არის დაკავშირებული კლუბთან.</div>
      </ClubShell>
    );
  }

  return (
    <ClubShell
      clubName={club.name}
      league={club.league}
      email={session.email}
      title="ახალი სინჯი"
      subtitle="გამოქვეყნების შემდეგ გამოჩნდება მორგებულ მოთამაშეებთან"
    >
      <ClubTrialNewForm clubName={club.name} league={club.league} />
    </ClubShell>
  );
}
