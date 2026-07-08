// Georgian labels for enum values — shared across UI.
import type { Position, AgeGroup, Level, Role } from "./generated/prisma/enums";

export const positionLabels: Record<Position, string> = {
  GK: "მეკარე",
  DF: "დამცველი",
  MF: "ნახევარმცველი",
  FW: "თავდამსხმელი",
};

export const ageGroupLabels: Record<AgeGroup, string> = {
  U13: "U13",
  U15: "U15",
  U17: "U17",
  U19: "U19",
  U21: "U21",
  SENIOR: "ზრდასრული",
};

export const levelLabels: Record<Level, string> = {
  BEGINNER: "დამწყები",
  AMATEUR: "მოყვარული",
  SEMI_PRO: "ნახევრად პროფესიონალი",
  PRO: "პროფესიონალი",
};

export const roleLabels: Record<Role, string> = {
  PLAYER: "ფეხბურთელი",
  CLUB: "კლუბი",
  ADMIN: "ადმინისტრატორი",
};

export const positionOptions = Object.entries(positionLabels).map(
  ([value, label]) => ({ value: value as Position, label }),
);
export const ageGroupOptions = Object.entries(ageGroupLabels).map(
  ([value, label]) => ({ value: value as AgeGroup, label }),
);
export const levelOptions = Object.entries(levelLabels).map(
  ([value, label]) => ({ value: value as Level, label }),
);

// Common Georgian cities for selects
export const cityOptions = [
  "თბილისი",
  "ბათუმი",
  "ქუთაისი",
  "რუსთავი",
  "ზუგდიდი",
  "გორი",
  "ფოთი",
  "თელავი",
  "ოზურგეთი",
  "მცხეთა",
];

// Georgian league tiers
export const leagueOptions = [
  "ეროვნული ლიგა",
  "ეროვნული ლიგა 2",
  "ლიგა 3",
  "რეგიონული ლიგა",
  "ამატორული ლიგა",
];

// Compute age group from birth date
export function ageGroupFromBirthDate(birthDate: Date): AgeGroup {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  if (age <= 13) return "U13";
  if (age <= 15) return "U15";
  if (age <= 17) return "U17";
  if (age <= 19) return "U19";
  if (age <= 21) return "U21";
  return "SENIOR";
}
