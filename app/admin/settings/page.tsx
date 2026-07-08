import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/app/AdminShell";
import { AdminSettingsContent, type AdminUser } from "./AdminSettingsContent";

export default async function AdminSettingsPage() {
  const session = await requireUser(["ADMIN"]);
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "asc" },
  });

  const list: AdminUser[] = admins.map((a, i) => ({
    n: 15 + i * 12,
    name: a.email.split("@")[0],
    email: a.email,
    role: i === 0 ? "სუპერ ადმინი" : "მოდერატორი",
    tone: i === 0 ? "iris" : "accent",
    you: a.id === session.userId,
  }));

  return (
    <AdminShell email={session.email} title="პარამეტრები" subtitle="პლატფორმა, თავსებადობის ალგორითმი და ადმინები">
      <AdminSettingsContent admins={list} />
    </AdminShell>
  );
}
