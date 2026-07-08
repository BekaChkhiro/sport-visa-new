import { requireUser } from "@/lib/session";
import { getClubForUser } from "@/lib/club";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubSettingsContent } from "./ClubSettingsContent";

export default async function ClubSettingsPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);

  return (
    <ClubShell clubName={club?.name ?? "—"} league={club?.league ?? "—"} email={session.email} title="პარამეტრები" subtitle="ანგარიში, შეტყობინებები და გუნდის წევრები">
      <ClubSettingsContent email={session.email} clubName={club?.name ?? "—"} />
    </ClubShell>
  );
}
