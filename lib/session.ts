import "server-only";
import { redirect } from "next/navigation";
import { getSession } from "./auth";
import type { Role } from "./generated/prisma/enums";

// Require a session, optionally with one of the allowed roles.
export async function requireUser(allowedRoles?: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(homePathForRole(session.role));
  }
  return session;
}

export function homePathForRole(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "CLUB":
      return "/club";
    case "PLAYER":
    default:
      return "/dashboard";
  }
}
