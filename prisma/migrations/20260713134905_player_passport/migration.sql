-- CreateEnum
CREATE TYPE "Foot" AS ENUM ('RIGHT', 'LEFT', 'BOTH');

-- AlterTable
ALTER TABLE "PlayerProfile" ADD COLUMN     "activeSeason" TEXT,
ADD COLUMN     "contractDocUrl" TEXT,
ADD COLUMN     "contractEnd" TIMESTAMP(3),
ADD COLUMN     "contractStart" TIMESTAMP(3),
ADD COLUMN     "currentTeam" TEXT,
ADD COLUMN     "gradesSheetUrl" TEXT,
ADD COLUMN     "jerseyNumber" INTEGER,
ADD COLUMN     "leftFootPct" INTEGER,
ADD COLUMN     "nationality" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "preferredFoot" "Foot",
ADD COLUMN     "rightFootPct" INTEGER,
ADD COLUMN     "school" TEXT,
ADD COLUMN     "sprint10m" DOUBLE PRECISION,
ADD COLUMN     "sprint30m" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "PositionSkill" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "position" "Position" NOT NULL,
    "percentage" INTEGER NOT NULL,

    CONSTRAINT "PositionSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerEntry" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "teamName" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER,
    "position" "Position",
    "jerseyNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CareerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchLink" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "matchDate" TIMESTAMP(3),
    "opponent" TEXT,
    "competition" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PositionSkill_playerId_position_key" ON "PositionSkill"("playerId", "position");

-- AddForeignKey
ALTER TABLE "PositionSkill" ADD CONSTRAINT "PositionSkill_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerEntry" ADD CONSTRAINT "CareerEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchLink" ADD CONSTRAINT "MatchLink_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "PlayerProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
