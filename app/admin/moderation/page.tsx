import { requireUser } from "@/lib/session";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminModerationContent } from "./AdminModerationContent";

export default async function AdminModerationPage() {
  const session = await requireUser(["ADMIN"]);
  // No report model yet — moderation queue starts empty.
  return (
    <AdminShell email={session.email} title="მოდერაცია" subtitle="დარეპორტებული პროფილები და მასალა" moderationCount={0}>
      <AdminModerationContent />
    </AdminShell>
  );
}
