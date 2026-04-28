import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seedar databasen...");

  await Promise.all([
    prisma.adminSetting.upsert({ where: { key: "site_name" },        update: {}, create: { key: "site_name",          value: "Minodling" } }),
    prisma.adminSetting.upsert({ where: { key: "site_description" }, update: {}, create: { key: "site_description",   value: "Sveriges odlingscommunity" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_post" },  update: {}, create: { key: "points_per_post",    value: "10" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_comment" }, update: {}, create: { key: "points_per_comment", value: "2" } }),
    prisma.adminSetting.upsert({ where: { key: "points_per_answer" }, update: {}, create: { key: "points_per_answer",  value: "5" } }),
  ]);

  console.log("✅ Admin-inställningar seedade");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
