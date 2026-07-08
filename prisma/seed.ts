import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import type {
  Position,
  AgeGroup,
  Level,
} from "../lib/generated/prisma/enums";
import { computeMatchScore } from "../lib/matching";
import { ageGroupFromBirthDate } from "../lib/labels";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const PASSWORD = "password123";

function birthDateForAge(age: number): Date {
  const now = new Date();
  return new Date(now.getFullYear() - age, 5, 15);
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(11, 0, 0, 0);
  return d;
}

async function main() {
  console.log("🌱 ვასუფთავებ ძველ მონაცემებს...");
  await prisma.trialApplication.deleteMany();
  await prisma.trial.deleteMany();
  await prisma.playerMedia.deleteMany();
  await prisma.clubUser.deleteMany();
  await prisma.playerProfile.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  // ---- ADMIN ----
  await prisma.user.create({
    data: {
      email: "admin@sportvisa.ge",
      passwordHash,
      role: "ADMIN",
    },
  });
  console.log("✅ ადმინი: admin@sportvisa.ge");

  // ---- CLUBS (admin-created) + club manager users ----
  const clubsData: {
    name: string;
    city: string;
    league: string;
    description: string;
    positionsNeeded: Position[];
    ageGroups: AgeGroup[];
    acceptingTrials: boolean;
    managerEmail: string;
  }[] = [
    {
      name: "დინამო თბილისი",
      city: "თბილისი",
      league: "ეროვნული ლიგა",
      description: "საქართველოს ისტორიული გრანდი, აქტიური აკადემიით.",
      positionsNeeded: ["FW", "MF"],
      ageGroups: ["U17", "U19", "U21"],
      acceptingTrials: true,
      managerEmail: "dinamo@sportvisa.ge",
    },
    {
      name: "დინამო ბათუმი",
      city: "ბათუმი",
      league: "ეროვნული ლიგა",
      description: "სამხრეთის ლიდერი კლუბი, ძლიერი ინფრასტრუქტურით.",
      positionsNeeded: ["DF", "GK"],
      ageGroups: ["U19", "U21", "SENIOR"],
      acceptingTrials: true,
      managerEmail: "batumi@sportvisa.ge",
    },
    {
      name: "ტორპედო ქუთაისი",
      city: "ქუთაისი",
      league: "ეროვნული ლიგა",
      description: "დასავლეთ საქართველოს ტრადიციული კლუბი.",
      positionsNeeded: ["MF", "DF", "FW"],
      ageGroups: ["U15", "U17", "U19"],
      acceptingTrials: true,
      managerEmail: "torpedo@sportvisa.ge",
    },
    {
      name: "საბურთალო",
      city: "თბილისი",
      league: "ეროვნული ლიგა 2",
      description: "ახალგაზრდული განვითარების ცენტრი დედაქალაქში.",
      positionsNeeded: ["FW", "GK", "DF"],
      ageGroups: ["U15", "U17"],
      acceptingTrials: true,
      managerEmail: "saburtalo@sportvisa.ge",
    },
    {
      name: "რუსთავი",
      city: "რუსთავი",
      league: "ლიგა 3",
      description: "მზარდი კლუბი, ღია მიღებით ახალგაზრდებზე.",
      positionsNeeded: ["MF", "FW"],
      ageGroups: ["U17", "U19", "U21", "SENIOR"],
      acceptingTrials: true,
      managerEmail: "rustavi@sportvisa.ge",
    },
    {
      name: "ზუგდიდი FC",
      city: "ზუგდიდი",
      league: "რეგიონული ლიგა",
      description: "სამეგრელოს რეგიონული კლუბი.",
      positionsNeeded: ["DF", "MF", "FW", "GK"],
      ageGroups: ["U13", "U15", "U17"],
      acceptingTrials: false, // მიღება ჯერ დახურულია — ტესტისთვის
      managerEmail: "zugdidi@sportvisa.ge",
    },
  ];

  const clubs: Awaited<ReturnType<typeof prisma.club.create>>[] = [];
  for (const c of clubsData) {
    const club = await prisma.club.create({
      data: {
        name: c.name,
        city: c.city,
        league: c.league,
        description: c.description,
        positionsNeeded: c.positionsNeeded,
        ageGroups: c.ageGroups,
        acceptingTrials: c.acceptingTrials,
        members: {
          create: {
            user: {
              create: {
                email: c.managerEmail,
                passwordHash,
                role: "CLUB",
              },
            },
          },
        },
      },
    });
    clubs.push(club);
    console.log(`✅ კლუბი: ${c.name} (მენეჯერი: ${c.managerEmail})`);
  }

  // ---- TRIALS (only for clubs that accept) ----
  const trials: Awaited<ReturnType<typeof prisma.trial.create>>[] = [];
  const openClubs = clubs.filter((c) => c.acceptingTrials);
  let ti = 0;
  for (const club of openClubs) {
    // 1–2 trials per open club
    const count = ti % 2 === 0 ? 2 : 1;
    for (let k = 0; k < count; k++) {
      const trial = await prisma.trial.create({
        data: {
          clubId: club.id,
          title:
            k === 0
              ? `${club.name} — ღია სინჯები`
              : `${club.name} — მეორე ეტაპი`,
          date: daysFromNow(7 + ti * 3 + k * 5),
          location: `${club.city}, ცენტრალური სტადიონი`,
          criteria: "თან იქონიეთ ბუცები და სპორტული ფორმა. გახურება 30 წუთით ადრე.",
          positions: club.positionsNeeded,
          ageGroups: club.ageGroups,
          slotsLimit: 20,
          isOpen: true,
        },
      });
      trials.push(trial);
      console.log(`  🗓  სინჯი: ${trial.title} (${trial.date.toLocaleDateString("ka-GE")})`);
    }
    ti++;
  }

  // ---- PLAYERS ----
  const firstNames = [
    "გიორგი", "ლუკა", "ნიკა", "საბა", "დავითი", "ლევანი", "ბექა", "ირაკლი",
    "ალექსანდრე", "ტატო", "ვახო", "გელა", "ზურა", "მიშა", "თორნიკე", "სანდრო",
    "ანდრია", "დათო",
  ];
  const lastNames = [
    "ბერიძე", "მამარდაშვილი", "კვარაცხელია", "ჩაკვეტაძე", "ლობჟანიძე",
    "ცხადაძე", "ხოჩოლავა", "დვალი", "აზაროვი", "ქვირქველია", "მიქაუტაძე",
    "წითაიშვილი", "გვილია", "ქაშია", "ლოკოშვილი", "მჭედლიძე", "ღვინიანიძე",
    "ტაბატაძე",
  ];
  const positions: Position[] = ["GK", "DF", "MF", "FW"];
  const levels: Level[] = ["BEGINNER", "AMATEUR", "SEMI_PRO", "PRO"];
  const cities = ["თბილისი", "ბათუმი", "ქუთაისი", "რუსთავი", "ზუგდიდი"];
  const leagues = ["ეროვნული ლიგა", "ეროვნული ლიგა 2", "ლიგა 3", "რეგიონული ლიგა", "ამატორული ლიგა"];
  const ages = [14, 16, 16, 17, 18, 18, 19, 20, 20, 21, 22, 24, 17, 19, 15, 23, 18, 16];

  const players: Awaited<ReturnType<typeof prisma.playerProfile.create>>[] = [];
  for (let i = 0; i < firstNames.length; i++) {
    const birthDate = birthDateForAge(ages[i]);
    const position = positions[i % positions.length];
    const level = levels[i % levels.length];
    const city = cities[i % cities.length];
    const currentLeague = leagues[i % leagues.length];
    const email = `player${i + 1}@sportvisa.ge`;

    const profile = await prisma.playerProfile.create({
      data: {
        firstName: firstNames[i],
        lastName: lastNames[i],
        birthDate,
        ageGroup: ageGroupFromBirthDate(birthDate),
        position,
        city,
        level,
        currentLeague,
        heightCm: 165 + (i % 25),
        weightKg: 60 + (i % 25),
        bio: "მოტივირებული ფეხბურთელი, ვეძებ ახალ გამოწვევას.",
        onboarded: true,
        user: {
          create: { email, passwordHash, role: "PLAYER" },
        },
        media: {
          create: [
            {
              type: "VIDEO",
              url: "https://www.w3schools.com/html/mov_bbb.mp4",
              caption: "საუკეთესო მომენტები",
            },
            {
              type: "PHOTO",
              url: `https://picsum.photos/seed/player${i + 1}/600/400`,
              caption: "სავარჯიშო",
            },
          ],
        },
      },
    });
    players.push(profile);
  }
  console.log(`✅ ${players.length} ფეხბურთელი შეიქმნა`);

  // ---- APPLICATIONS: simulate the flow ----
  // Each player is auto-registered to open trials where match score >= 50 (top 2).
  let appCount = 0;
  for (const player of players) {
    const scored = trials
      .map((t) => {
        const club = clubs.find((c) => c.id === t.clubId)!;
        const score = computeMatchScore(
          {
            position: player.position,
            ageGroup: player.ageGroup,
            city: player.city,
            level: player.level,
          },
          {
            positionsNeeded: club.positionsNeeded,
            ageGroups: club.ageGroups,
            city: club.city,
            league: club.league,
          },
        );
        return { trial: t, score };
      })
      .filter((s) => s.score >= 50)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2);

    for (const s of scored) {
      await prisma.trialApplication.create({
        data: {
          trialId: s.trial.id,
          playerId: player.id,
          matchScore: s.score,
        },
      });
      appCount++;
    }
  }
  console.log(`✅ ${appCount} განაცხადი (auto-match) დარეგისტრირდა`);

  console.log("\n🎉 Seed დასრულდა!");
  console.log("─────────────────────────────");
  console.log("სატესტო ანგარიშები (პაროლი ყველასთვის: password123):");
  console.log("  ადმინი:  admin@sportvisa.ge");
  console.log("  კლუბი:   dinamo@sportvisa.ge (და სხვა კლუბები)");
  console.log("  მოთამაშე: player1@sportvisa.ge ... player18@sportvisa.ge");
  console.log("─────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
