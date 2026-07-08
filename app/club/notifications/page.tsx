import { requireUser } from "@/lib/session";
import { getClubForUser } from "@/lib/club";
import { ClubShell } from "@/components/app/ClubShell";
import { ClubNotificationsContent } from "./ClubNotificationsContent";

export default async function ClubNotificationsPage() {
  const session = await requireUser(["CLUB"]);
  const club = await getClubForUser(session.userId);
  return (
    <ClubShell clubName={club?.name ?? "—"} league={club?.league ?? "—"} email={session.email} title="შეტყობინებები" subtitle="ახალი განაცხადები და კლუბის აქტივობა">
      <ClubNotificationsContent />
    </ClubShell>
  );
}
