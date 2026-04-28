import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seedar databasen...");

  // Kategorier
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "gronsaker" },
      update: {},
      create: {
        name: "Grönsaker",
        slug: "gronsaker",
        description: "Tomater, gurkor, paprika, morötter och mer",
        color: "#4A7C59",
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: "frukt-bar" },
      update: {},
      create: {
        name: "Frukt & bär",
        slug: "frukt-bar",
        description: "Jordgubbar, hallon, äpplen och bär",
        color: "#E85D75",
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: "orter" },
      update: {},
      create: {
        name: "Örter",
        slug: "orter",
        description: "Basilika, persilja, mynta och kryddörter",
        color: "#7FB069",
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: "blommor" },
      update: {},
      create: {
        name: "Blommor",
        slug: "blommor",
        description: "Sommarblommor, perenner och prydnadsväxter",
        color: "#C77DFF",
        sortOrder: 4,
      },
    }),
    prisma.category.upsert({
      where: { slug: "kompost" },
      update: {},
      create: {
        name: "Kompost & jord",
        slug: "kompost",
        description: "Jordens kemi, kompostering och gödning",
        color: "#8B6F47",
        sortOrder: 5,
      },
    }),
    prisma.category.upsert({
      where: { slug: "vaxthuSet" },
      update: {},
      create: {
        name: "Växthuset",
        slug: "vaxthuSet",
        description: "Odling i växthus och tunnlar",
        color: "#2D9CDB",
        sortOrder: 6,
      },
    }),
    prisma.category.upsert({
      where: { slug: "nybörjare" },
      update: {},
      create: {
        name: "Nybörjare",
        slug: "nybörjare",
        description: "Kom igång med odling – tips för nybörjare",
        color: "#F7B731",
        sortOrder: 7,
      },
    }),
  ]);

  // Badges
  await Promise.all([
    prisma.badge.upsert({
      where: { name: "Första grödan" },
      update: {},
      create: {
        name: "Första grödan",
        description: "Delade sin första skörd",
        color: "#4A7C59",
        pointsReward: 50,
      },
    }),
    prisma.badge.upsert({
      where: { name: "Odlingsveteran" },
      update: {},
      create: {
        name: "Odlingsveteran",
        description: "100 inlägg i forumet",
        color: "#F7B731",
        pointsReward: 200,
      },
    }),
    prisma.badge.upsert({
      where: { name: "Kompostmästare" },
      update: {},
      create: {
        name: "Kompostmästare",
        description: "Expert på kompostering",
        color: "#8B6F47",
        pointsReward: 100,
      },
    }),
    prisma.badge.upsert({
      where: { name: "Välkommen" },
      update: {},
      create: {
        name: "Välkommen",
        description: "Skapade ett konto på Minodling",
        color: "#2D9CDB",
        pointsReward: 10,
      },
    }),
  ]);

  console.log(`✅ Seedat ${categories.length} kategorier och 4 badges`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
