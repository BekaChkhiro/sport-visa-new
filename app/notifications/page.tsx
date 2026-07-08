import { requireUser } from "@/lib/session";
import { PlayerNotificationsScreen } from "./PlayerNotificationsScreen";

export default async function NotificationsPage() {
  const session = await requireUser(["PLAYER"]);
  return <PlayerNotificationsScreen email={session.email} />;
}
