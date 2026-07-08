"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { computeMatchScore } from "@/lib/matching";
import { ageGroupFromBirthDate } from "@/lib/labels";
import { deleteByUrl } from "@/lib/storage";
import { getRecommendedTrials } from "@/lib/recommendations";

export type FormState = { error?: string; ok?: boolean } | undefined;

const onboardingSchema = z.object({
  firstName: z.string().min(2, "შეიყვანეთ სახელი"),
  lastName: z.string().min(2, "შეიყვანეთ გვარი"),
  birthDate: z.string().min(1, "აირჩიეთ დაბადების თარიღი"),
  position: z.enum(["GK", "DF", "MF", "FW"]),
  city: z.string().min(2, "აირჩიეთ ქალაქი"),
  level: z.enum(["BEGINNER", "AMATEUR", "SEMI_PRO", "PRO"]),
  currentLeague: z.string().min(2, "აირჩიეთ ლიგა"),
  heightCm: z.string().optional(),
  weightKg: z.string().optional(),
  bio: z.string().optional(),
});

export async function completeOnboarding(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);

  const parsed = onboardingSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    position: formData.get("position"),
    city: formData.get("city"),
    level: formData.get("level"),
    currentLeague: formData.get("currentLeague"),
    heightCm: formData.get("heightCm") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსეთ ველები სწორად" };
  }

  const d = parsed.data;
  const birthDate = new Date(d.birthDate);
  const ageGroup = ageGroupFromBirthDate(birthDate);

  const data = {
    firstName: d.firstName,
    lastName: d.lastName,
    birthDate,
    ageGroup,
    position: d.position,
    city: d.city,
    level: d.level,
    currentLeague: d.currentLeague,
    heightCm: d.heightCm ? parseInt(d.heightCm, 10) : null,
    weightKg: d.weightKg ? parseInt(d.weightKg, 10) : null,
    bio: d.bio ?? null,
    onboarded: true,
  };

  await prisma.playerProfile.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, ...data },
    update: data,
  });

  redirect("/dashboard");
}

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);

  const parsed = onboardingSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    position: formData.get("position"),
    city: formData.get("city"),
    level: formData.get("level"),
    currentLeague: formData.get("currentLeague"),
    heightCm: formData.get("heightCm") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    bio: formData.get("bio") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსეთ ველები სწორად" };
  }

  const d = parsed.data;
  const birthDate = new Date(d.birthDate);

  await prisma.playerProfile.update({
    where: { userId: session.userId },
    data: {
      firstName: d.firstName,
      lastName: d.lastName,
      birthDate,
      ageGroup: ageGroupFromBirthDate(birthDate),
      position: d.position,
      city: d.city,
      level: d.level,
      currentLeague: d.currentLeague,
      heightCm: d.heightCm ? parseInt(d.heightCm, 10) : null,
      weightKg: d.weightKg ? parseInt(d.weightKg, 10) : null,
      bio: d.bio ?? null,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
}

// Account name update (settings → account)
export async function updateAccount(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (firstName.length < 2 || lastName.length < 2) {
    return { error: "შეავსე სახელი და გვარი" };
  }
  await prisma.playerProfile.update({
    where: { userId: session.userId },
    data: { firstName, lastName },
  });
  revalidatePath("/profile");
  revalidatePath("/player-settings");
  return { ok: true };
}

// Password change (settings → account)
export async function changePassword(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser(["PLAYER", "CLUB", "ADMIN"]);
  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (next.length < 6) return { error: "ახალი პაროლი მინიმუმ 6 სიმბოლო" };
  if (next !== confirm) return { error: "პაროლები არ ემთხვევა" };

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(current, user.passwordHash))) {
    return { error: "მიმდინარე პაროლი არასწორია" };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });
  return { ok: true };
}

// Full wizard submit — saves profile + media, returns matched clubs for the reveal.
export type OnboardingInput = {
  firstName: string;
  lastName: string;
  birthDate: string;
  position: "GK" | "DF" | "MF" | "FW";
  city: string;
  level: "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";
  currentLeague: string;
  media: string[];
};

export type MatchRevealDTO = {
  club: string;
  badge: string;
  league: string;
  score: number;
};

const onboardingWizardSchema = z.object({
  firstName: z.string().min(2, "შეიყვანე სახელი"),
  lastName: z.string().min(2, "შეიყვანე გვარი"),
  birthDate: z.string().min(1, "აირჩიე დაბადების თარიღი"),
  position: z.enum(["GK", "DF", "MF", "FW"]),
  city: z.string().min(2, "აირჩიე ქალაქი"),
  level: z.enum(["BEGINNER", "AMATEUR", "SEMI_PRO", "PRO"]),
  currentLeague: z.string().min(2, "შეიყვანე ლიგა"),
  media: z.array(z.string().url()).optional(),
});

function clubInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
}

export async function submitOnboarding(
  input: OnboardingInput,
): Promise<{ error?: string; matches?: MatchRevealDTO[] }> {
  const session = await requireUser(["PLAYER"]);
  const parsed = onboardingWizardSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსე ველები სწორად" };
  }

  const d = parsed.data;
  const birthDate = new Date(d.birthDate);
  const data = {
    firstName: d.firstName,
    lastName: d.lastName,
    birthDate,
    ageGroup: ageGroupFromBirthDate(birthDate),
    position: d.position,
    city: d.city,
    level: d.level,
    currentLeague: d.currentLeague,
    onboarded: true,
  };

  const profile = await prisma.playerProfile.upsert({
    where: { userId: session.userId },
    create: { userId: session.userId, ...data },
    update: data,
  });

  // Persist media links as VIDEO entries
  if (d.media && d.media.length) {
    await prisma.playerMedia.createMany({
      data: d.media.map((url) => ({
        playerId: profile.id,
        type: "VIDEO" as const,
        url,
      })),
    });
  }

  // Compute reveal — top clubs by score (dedup by club)
  const recs = await getRecommendedTrials(profile);
  const byClub = new Map<string, MatchRevealDTO>();
  for (const r of recs) {
    const existing = byClub.get(r.clubId);
    if (!existing || r.matchScore > existing.score) {
      byClub.set(r.clubId, {
        club: r.clubName,
        badge: clubInitials(r.clubName),
        league: r.clubLeague,
        score: r.matchScore,
      });
    }
  }
  const matches = [...byClub.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  revalidatePath("/dashboard");
  return { matches };
}

// Apply to a trial — computes & stores the match score at apply time.
export async function applyToTrial(trialId: string): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);

  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player) return { error: "ჯერ შეავსეთ პროფილი" };

  const trial = await prisma.trial.findUnique({
    where: { id: trialId },
    include: { club: true, _count: { select: { applications: true } } },
  });
  if (!trial || !trial.isOpen || !trial.club.acceptingTrials) {
    return { error: "სინჯი აღარ არის ხელმისაწვდომი" };
  }
  if (trial._count.applications >= trial.slotsLimit) {
    return { error: "ადგილები შევსებულია" };
  }

  const matchScore = computeMatchScore(
    {
      position: player.position,
      ageGroup: player.ageGroup,
      city: player.city,
      level: player.level,
    },
    {
      positionsNeeded: trial.club.positionsNeeded,
      ageGroups: trial.club.ageGroups,
      city: trial.club.city,
      league: trial.club.league,
    },
  );

  try {
    await prisma.trialApplication.create({
      data: { trialId, playerId: player.id, matchScore },
    });
  } catch {
    return { error: "უკვე ხართ ჩაწერილი ამ სინჯზე" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

const mediaSchema = z.object({
  type: z.enum(["VIDEO", "PHOTO"]),
  url: z.string().url("შეიყვანეთ სწორი ბმული"),
  caption: z.string().optional(),
});

export async function addMedia(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player) return { error: "ჯერ შეავსეთ პროფილი" };

  const parsed = mediaSchema.safeParse({
    type: formData.get("type"),
    url: formData.get("url"),
    caption: formData.get("caption") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეამოწმეთ ველები" };
  }

  await prisma.playerMedia.create({
    data: {
      playerId: player.id,
      type: parsed.data.type,
      url: parsed.data.url,
      caption: parsed.data.caption ?? null,
    },
  });

  revalidatePath("/profile");
  return { ok: true };
}

export async function deleteMedia(mediaId: string): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player) return { error: "პროფილი ვერ მოიძებნა" };

  // Only delete media that belongs to this player
  const media = await prisma.playerMedia.findFirst({
    where: { id: mediaId, playerId: player.id },
  });
  if (!media) return { error: "მედია ვერ მოიძებნა" };

  await prisma.playerMedia.delete({ where: { id: media.id } });
  // Remove the underlying file from disk (no-op for external URLs)
  await deleteByUrl(media.url);

  revalidatePath("/profile");
  return { ok: true };
}

export async function withdrawApplication(trialId: string): Promise<FormState> {
  const session = await requireUser(["PLAYER"]);
  const player = await prisma.playerProfile.findUnique({
    where: { userId: session.userId },
  });
  if (!player) return { error: "პროფილი ვერ მოიძებნა" };

  await prisma.trialApplication.deleteMany({
    where: { trialId, playerId: player.id },
  });
  revalidatePath("/dashboard");
  return { ok: true };
}
