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

// Full wizard submit — saves profile + passport + media, returns matched clubs.
type Pos = "GK" | "DF" | "MF" | "FW";

export type PositionSkillInput = { position: Pos; percentage: number };
export type CareerInput = {
  teamName: string;
  startYear: number;
  endYear?: number | null;
  position?: Pos | null;
  jerseyNumber?: number | null;
};
export type MatchLinkInput = {
  url: string;
  matchDate?: string | null;
  opponent?: string | null;
  competition?: string | null;
};

export type OnboardingInput = {
  // --- required core (feeds matching) ---
  firstName: string;
  lastName: string;
  birthDate: string;
  position: Pos;
  city: string;
  level: "BEGINNER" | "AMATEUR" | "SEMI_PRO" | "PRO";
  currentLeague: string;
  // --- optional passport ---
  photoUrl?: string | null;
  nationality?: string | null;
  school?: string | null;
  gradesSheetUrl?: string | null;
  heightCm?: number | null;
  weightKg?: number | null;
  sprint10m?: number | null;
  sprint30m?: number | null;
  activeSeason?: string | null;
  currentTeam?: string | null;
  contractStart?: string | null;
  contractEnd?: string | null;
  contractDocUrl?: string | null;
  jerseyNumber?: number | null;
  preferredFoot?: "RIGHT" | "LEFT" | "BOTH" | null;
  rightFootPct?: number | null;
  leftFootPct?: number | null;
  positionSkills?: PositionSkillInput[];
  career?: CareerInput[];
  matchLinks?: MatchLinkInput[];
  media?: string[];
};

export type MatchRevealDTO = {
  club: string;
  badge: string;
  league: string;
  score: number;
};

const posEnum = z.enum(["GK", "DF", "MF", "FW"]);
const emptyToUndef = (v: unknown) => (v === "" || v === null ? undefined : v);
const optStr = z.preprocess(emptyToUndef, z.string().optional());
const optUrl = z.preprocess(
  emptyToUndef,
  z.string().url("არასწორი ბმული").optional(),
);
const optInt = z.preprocess(emptyToUndef, z.coerce.number().int().optional());
const optNum = z.preprocess(emptyToUndef, z.coerce.number().optional());
const optPct = z.preprocess(
  emptyToUndef,
  z.coerce.number().int().min(0).max(100).optional(),
);

const onboardingWizardSchema = z.object({
  firstName: z.string().min(2, "შეიყვანე სახელი"),
  lastName: z.string().min(2, "შეიყვანე გვარი"),
  birthDate: z.string().min(1, "აირჩიე დაბადების თარიღი"),
  position: posEnum,
  city: z.string().min(2, "აირჩიე ქალაქი"),
  level: z.enum(["BEGINNER", "AMATEUR", "SEMI_PRO", "PRO"]),
  currentLeague: z.string().min(2, "შეიყვანე ლიგა"),
  photoUrl: optUrl,
  nationality: optStr,
  school: optStr,
  gradesSheetUrl: optUrl,
  heightCm: optInt,
  weightKg: optInt,
  sprint10m: optNum,
  sprint30m: optNum,
  activeSeason: optStr,
  currentTeam: optStr,
  contractStart: optStr,
  contractEnd: optStr,
  contractDocUrl: optUrl,
  jerseyNumber: optInt,
  preferredFoot: z.enum(["RIGHT", "LEFT", "BOTH"]).nullish(),
  rightFootPct: optPct,
  leftFootPct: optPct,
  positionSkills: z
    .array(z.object({ position: posEnum, percentage: z.coerce.number().int().min(0).max(100) }))
    .optional(),
  career: z
    .array(
      z.object({
        teamName: z.string().min(1),
        startYear: z.coerce.number().int().min(1950).max(2100),
        endYear: optInt,
        position: posEnum.nullish(),
        jerseyNumber: optInt,
      }),
    )
    .optional(),
  matchLinks: z
    .array(
      z.object({
        url: z.string().url("არასწორი ბმული"),
        matchDate: optStr,
        opponent: optStr,
        competition: optStr,
      }),
    )
    .optional(),
  media: z.array(z.string().url()).optional(),
});

function clubInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
}

type WizardData = z.infer<typeof onboardingWizardSchema>;

// Shared persistence for onboarding + passport edit: upserts the profile and
// replaces the nested passport collections. Does NOT touch media (managed
// separately). Returns the profile.
async function persistProfile(userId: string, d: WizardData) {
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
    // passport
    photoUrl: d.photoUrl ?? null,
    nationality: d.nationality ?? null,
    school: d.school ?? null,
    gradesSheetUrl: d.gradesSheetUrl ?? null,
    heightCm: d.heightCm ?? null,
    weightKg: d.weightKg ?? null,
    sprint10m: d.sprint10m ?? null,
    sprint30m: d.sprint30m ?? null,
    activeSeason: d.activeSeason ?? null,
    currentTeam: d.currentTeam ?? null,
    contractStart: d.contractStart ? new Date(d.contractStart) : null,
    contractEnd: d.contractEnd ? new Date(d.contractEnd) : null,
    contractDocUrl: d.contractDocUrl ?? null,
    jerseyNumber: d.jerseyNumber ?? null,
    preferredFoot: d.preferredFoot ?? null,
    rightFootPct: d.rightFootPct ?? null,
    leftFootPct: d.leftFootPct ?? null,
  };

  const profile = await prisma.playerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  // Replace nested passport collections
  await prisma.$transaction([
    prisma.positionSkill.deleteMany({ where: { playerId: profile.id } }),
    prisma.careerEntry.deleteMany({ where: { playerId: profile.id } }),
    prisma.matchLink.deleteMany({ where: { playerId: profile.id } }),
  ]);
  if (d.positionSkills?.length) {
    await prisma.positionSkill.createMany({
      data: d.positionSkills.map((s) => ({
        playerId: profile.id,
        position: s.position,
        percentage: s.percentage,
      })),
    });
  }
  if (d.career?.length) {
    await prisma.careerEntry.createMany({
      data: d.career.map((c) => ({
        playerId: profile.id,
        teamName: c.teamName,
        startYear: c.startYear,
        endYear: c.endYear ?? null,
        position: c.position ?? null,
        jerseyNumber: c.jerseyNumber ?? null,
      })),
    });
  }
  if (d.matchLinks?.length) {
    await prisma.matchLink.createMany({
      data: d.matchLinks.map((m) => ({
        playerId: profile.id,
        url: m.url,
        matchDate: m.matchDate ? new Date(m.matchDate) : null,
        opponent: m.opponent ?? null,
        competition: m.competition ?? null,
      })),
    });
  }
  return profile;
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
  const profile = await persistProfile(session.userId, d);

  // Persist highlight links as VIDEO entries
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

// Edit-mode save — full passport update from the profile edit form.
export async function saveProfileEdits(
  input: OnboardingInput,
): Promise<{ error?: string; ok?: boolean }> {
  const session = await requireUser(["PLAYER"]);
  const parsed = onboardingWizardSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "შეავსე ველები სწორად" };
  }
  await persistProfile(session.userId, parsed.data);
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { ok: true };
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
