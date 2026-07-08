"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { hashPassword } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;

const clubSchema = z.object({
  name: z.string().min(2, "შეიყვანეთ კლუბის სახელი"),
  city: z.string().min(2, "აირჩიეთ ქალაქი"),
  league: z.string().min(2, "აირჩიეთ ლიგა"),
  description: z.string().optional(),
  positionsNeeded: z.array(z.enum(["GK", "DF", "MF", "FW"])).optional(),
  ageGroups: z
    .array(z.enum(["U13", "U15", "U17", "U19", "U21", "SENIOR"]))
    .optional(),
  managerEmail: z.string().email("არასწორი ელ. ფოსტა"),
  managerPassword: z.string().min(6, "პაროლი მინიმუმ 6 სიმბოლო"),
  acceptingTrials: z.string().optional(),
});

export async function createClub(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser(["ADMIN"]);

  const parsed = clubSchema.safeParse({
    name: formData.get("name"),
    city: formData.get("city"),
    league: formData.get("league"),
    description: formData.get("description") || undefined,
    positionsNeeded: formData.getAll("positionsNeeded"),
    ageGroups: formData.getAll("ageGroups"),
    managerEmail: formData.get("managerEmail"),
    managerPassword: formData.get("managerPassword"),
    acceptingTrials: formData.get("acceptingTrials") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსეთ ველები სწორად" };
  }

  const d = parsed.data;
  const email = d.managerEmail.toLowerCase().trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "ეს ელ. ფოსტა უკვე გამოყენებულია" };
  }

  await prisma.club.create({
    data: {
      name: d.name,
      city: d.city,
      league: d.league,
      description: d.description ?? null,
      positionsNeeded: d.positionsNeeded ?? [],
      ageGroups: d.ageGroups ?? [],
      acceptingTrials: d.acceptingTrials === "on",
      members: {
        create: {
          user: {
            create: {
              email,
              passwordHash: await hashPassword(d.managerPassword),
              role: "CLUB",
            },
          },
        },
      },
    },
  });

  revalidatePath("/admin");
  return { ok: `კლუბი "${d.name}" შეიქმნა (მენეჯერი: ${email})` };
}

const adminTrialSchema = z.object({
  clubId: z.string().min(1, "აირჩიე კლუბი"),
  title: z.string().min(3, "შეიყვანე სათაური"),
  date: z.string().min(1, "აირჩიე თარიღი"),
  location: z.string().min(2, "შეიყვანე ადგილი"),
  criteria: z.string().optional(),
  slotsLimit: z.coerce.number().int().min(1, "მინიმუმ 1 ადგილი").max(200),
  positions: z.array(z.enum(["GK", "DF", "MF", "FW"])).optional(),
  ageGroups: z.array(z.enum(["U13", "U15", "U17", "U19", "U21", "SENIOR"])).optional(),
});

// Admin creates a trial for any chosen club.
export async function createTrialForClub(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireUser(["ADMIN"]);

  const parsed = adminTrialSchema.safeParse({
    clubId: formData.get("clubId"),
    title: formData.get("title"),
    date: formData.get("date"),
    location: formData.get("location"),
    criteria: formData.get("criteria") || undefined,
    slotsLimit: formData.get("slotsLimit"),
    positions: formData.getAll("positions"),
    ageGroups: formData.getAll("ageGroups"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსე ველები სწორად" };
  }

  const d = parsed.data;
  const club = await prisma.club.findUnique({ where: { id: d.clubId } });
  if (!club) return { error: "კლუბი ვერ მოიძებნა" };

  await prisma.trial.create({
    data: {
      clubId: d.clubId,
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
  await prisma.club.update({ where: { id: d.clubId }, data: { acceptingTrials: true } });

  revalidatePath("/admin/trials");
  revalidatePath("/admin");
  return { ok: `სინჯი დაემატა კლუბს „${club.name}"` };
}

export async function setClubAcceptingById(
  clubId: string,
  accepting: boolean,
): Promise<FormState> {
  await requireUser(["ADMIN"]);
  await prisma.club.update({ where: { id: clubId }, data: { acceptingTrials: accepting } });
  revalidatePath("/admin/clubs");
  return { ok: "განახლდა" };
}

export async function deleteClub(clubId: string): Promise<FormState> {
  await requireUser(["ADMIN"]);
  // Deleting the club cascades trials/applications; also remove the CLUB users.
  const members = await prisma.clubUser.findMany({
    where: { clubId },
    select: { userId: true },
  });
  await prisma.club.delete({ where: { id: clubId } });
  await prisma.user.deleteMany({
    where: { id: { in: members.map((m) => m.userId) } },
  });
  revalidatePath("/admin");
  return { ok: "კლუბი წაიშალა" };
}
