"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";
import { homePathForRole } from "@/lib/session";

export type AuthState = { error?: string } | undefined;

const registerSchema = z.object({
  firstName: z.string().min(2, "შეიყვანე სახელი"),
  lastName: z.string().min(2, "შეიყვანე გვარი"),
  email: z.string().email("არასწორი ელ. ფოსტა"),
  password: z.string().min(6, "პაროლი მინიმუმ 6 სიმბოლო"),
});

export async function registerPlayer(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შემოწმეთ ველები" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "ეს ელ. ფოსტა უკვე რეგისტრირებულია" };
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: await hashPassword(parsed.data.password),
      role: "PLAYER",
    },
  });

  await createSession({ userId: user.id, role: user.role, email: user.email });
  const q = new URLSearchParams({
    first: parsed.data.firstName,
    last: parsed.data.lastName,
  });
  redirect(`/onboarding?${q.toString()}`);
}

const loginSchema = z.object({
  email: z.string().email("არასწორი ელ. ფოსტა"),
  password: z.string().min(1, "შეიყვანეთ პაროლი"),
});

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შემოწმეთ ველები" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email },
    include: { player: true },
  });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "ელ. ფოსტა ან პაროლი არასწორია" };
  }

  await createSession({ userId: user.id, role: user.role, email: user.email });

  if (user.role === "PLAYER" && !user.player?.onboarded) {
    redirect("/onboarding");
  }
  redirect(homePathForRole(user.role));
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// Helper for pages/actions that need the current user id.
export async function currentUserId(): Promise<string | null> {
  const s = await getSession();
  return s?.userId ?? null;
}
