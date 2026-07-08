import "server-only";
import { prisma } from "./prisma";

// The club managed by the current CLUB user (or null).
export async function getClubForUser(userId: string) {
  const membership = await prisma.clubUser.findUnique({
    where: { userId },
    include: { club: true },
  });
  return membership?.club ?? null;
}

export function ageFromBirth(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}
