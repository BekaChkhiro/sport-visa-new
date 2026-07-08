"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export type FormState = { error?: string; ok?: boolean } | undefined;

// Resolve the club managed by the current CLUB user.
async function requireClubId(): Promise<
  { clubId: string } | { error: string }
> {
  const session = await requireUser(["CLUB"]);
  const membership = await prisma.clubUser.findUnique({
    where: { userId: session.userId },
  });
  if (!membership) return { error: "თქვენი ანგარიში კლუბს არ უკავშირდება" };
  return { clubId: membership.clubId };
}

const trialSchema = z.object({
  title: z.string().min(3, "შეიყვანეთ სათაური"),
  date: z.string().min(1, "აირჩიეთ თარიღი"),
  location: z.string().min(2, "შეიყვანეთ ადგილი"),
  criteria: z.string().optional(),
  slotsLimit: z.coerce.number().int().min(1, "მინიმუმ 1 ადგილი").max(200),
  positions: z.array(z.enum(["GK", "DF", "MF", "FW"])).optional(),
  ageGroups: z
    .array(z.enum(["U13", "U15", "U17", "U19", "U21", "SENIOR"]))
    .optional(),
});

export async function createTrial(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const club = await requireClubId();
  if ("error" in club) return { error: club.error };

  const parsed = trialSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    location: formData.get("location"),
    criteria: formData.get("criteria") || undefined,
    slotsLimit: formData.get("slotsLimit"),
    positions: formData.getAll("positions"),
    ageGroups: formData.getAll("ageGroups"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსეთ ველები სწორად" };
  }

  const d = parsed.data;
  await prisma.trial.create({
    data: {
      clubId: club.clubId,
      title: d.title,
      date: new Date(d.date),
      location: d.location,
      criteria: d.criteria ?? null,
      slotsLimit: d.slotsLimit,
      positions: d.positions ?? [],
      ageGroups: d.ageGroups ?? [],
      isOpen: true,
    },
  });

  // Ensure the club is marked as accepting when it opens a trial
  await prisma.club.update({
    where: { id: club.clubId },
    data: { acceptingTrials: true },
  });

  revalidatePath("/club");
  return { ok: true };
}

export async function toggleTrialOpen(
  trialId: string,
  isOpen: boolean,
): Promise<FormState> {
  const club = await requireClubId();
  if ("error" in club) return { error: club.error };

  await prisma.trial.updateMany({
    where: { id: trialId, clubId: club.clubId },
    data: { isOpen },
  });
  revalidatePath("/club");
  return { ok: true };
}

const clubProfileSchema = z.object({
  name: z.string().min(2, "შეიყვანე კლუბის სახელი"),
  city: z.string().min(2, "აირჩიე ქალაქი"),
  league: z.string().min(2, "აირჩიე ლიგა"),
  description: z.string().optional(),
  positionsNeeded: z.array(z.enum(["GK", "DF", "MF", "FW"])).optional(),
  ageGroups: z.array(z.enum(["U13", "U15", "U17", "U19", "U21", "SENIOR"])).optional(),
});

export async function updateClubProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const club = await requireClubId();
  if ("error" in club) return { error: club.error };

  const parsed = clubProfileSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    league: formData.get("league"),
    description: formData.get("description") || undefined,
    positionsNeeded: formData.getAll("positionsNeeded"),
    ageGroups: formData.getAll("ageGroups"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსე ველები სწორად" };
  }

  const d = parsed.data;
  await prisma.club.update({
    where: { id: club.clubId },
    data: {
      name: d.name,
      city: d.city,
      league: d.league,
      description: d.description ?? null,
      positionsNeeded: d.positionsNeeded ?? [],
      ageGroups: d.ageGroups ?? [],
    },
  });
  revalidatePath("/club/profile");
  revalidatePath("/club");
  return { ok: true };
}

export async function deleteTrial(trialId: string): Promise<FormState> {
  const club = await requireClubId();
  if ("error" in club) return { error: club.error };
  await prisma.trial.deleteMany({ where: { id: trialId, clubId: club.clubId } });
  revalidatePath("/club/trials");
  revalidatePath("/club");
  return { ok: true };
}

export async function setClubAccepting(
  accepting: boolean,
): Promise<FormState> {
  const club = await requireClubId();
  if ("error" in club) return { error: club.error };

  await prisma.club.update({
    where: { id: club.clubId },
    data: { acceptingTrials: accepting },
  });
  revalidatePath("/club");
  return { ok: true };
}
