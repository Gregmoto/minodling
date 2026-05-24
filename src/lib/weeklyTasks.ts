/**
 * Veckouppgifts-generator för "Din odlingsvecka"
 *
 * Genererar 3–5 uppgifter per vecka baserat på:
 *  1. Säsong (månad → templates från constants)
 *  2. Aktivt odlade växter (GardenDiary.status = "growing")
 *  3. Kommande påminnelser denna vecka
 *  4. Odlingskalender för aktuell månad
 *
 * Sparar uppgifterna i weekly_tasks och returnerar dem.
 * Om uppgifter redan finns för veckan returneras befintliga.
 */

import prisma from "@/lib/prisma";
import { SEASONAL_TASKS } from "@/app/odlingsvecka/constants";

// ── Veckokalkyl ──────────────────────────────────────────────────────

/** Returnerar ISO-veckonummer (1–53) och år för ett datum */
export function getISOWeek(date: Date): { weekYear: number; weekNumber: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Flytta till närmaste torsdag: aktuellt datum + 4 - veckodag
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { weekYear: d.getUTCFullYear(), weekNumber };
}

/** Veckans start (måndag 00:00) och slut (söndag 23:59) */
export function getWeekBounds(date: Date): { start: Date; end: Date } {
  const day = date.getDay() || 7; // måndag = 1, söndag = 7
  const start = new Date(date);
  start.setDate(date.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ── Hjälp ────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// ── Generatorn ───────────────────────────────────────────────────────

export async function generateWeeklyTasks(profileId: string): Promise<void> {
  const now    = new Date();
  const { weekYear, weekNumber } = getISOWeek(now);
  const month  = now.getMonth() + 1; // 1–12
  const { start: weekStart, end: weekEnd } = getWeekBounds(now);

  // Ta bort gamla uppgifter för veckan (vid regenerering)
  await prisma.weeklyTask.deleteMany({
    where: { profileId, weekYear, weekNumber, source: "system" },
  });

  const tasks: Array<{
    title:       string;
    description: string | null;
    icon:        string | null;
    source:      string;
    sourceId:    string | null;
    sortOrder:   number;
  }> = [];

  let order = 0;

  // ── 1–3. Hämta allt parallellt ─────────────────────────────────────
  const [reminders, diaries, calendarItems] = await Promise.all([
    prisma.reminder.findMany({
      where: {
        userId:      profileId,
        isCompleted: false,
        dueDate:     { gte: weekStart, lte: weekEnd },
      },
      orderBy: { dueDate: "asc" },
      take: 2,
    }),
    prisma.gardenDiary.findMany({
      where:   { userId: profileId, status: "growing" },
      orderBy: { updatedAt: "desc" },
      take:    3,
      select:  { id: true, title: true, customPlantName: true, plant: { select: { name: true } } },
    }),
    prisma.gardenCalendar.findMany({
      where:   { month, status: "published" },
      orderBy: { createdAt: "asc" },
      take:    5,
      select:  { id: true, title: true, description: true },
    }),
  ]);

  for (const r of reminders) {
    tasks.push({
      title:       r.title,
      description: r.description ?? null,
      icon:        "🔔",
      source:      "reminder",
      sourceId:    r.id,
      sortOrder:   order++,
    });
  }

  // ── 2. Aktiva växter i dagboken ─────────────────────────────────────
  const diaryTasks = [
    { verb: "Vattna",            suffix: "",                icon: "💧" },
    { verb: "Kontrollera blad på", suffix: " – kolla efter ohyra och sjukdomar", icon: "🔍" },
    { verb: "Gödsla",            suffix: "",                icon: "🌿" },
  ];

  for (const diary of diaries.slice(0, 2)) {
    const plantName = diary.plant?.name ?? diary.customPlantName ?? diary.title;
    const taskTpl   = diaryTasks[Math.floor(Math.random() * diaryTasks.length)];
    tasks.push({
      title:       `${taskTpl.verb} ${plantName}`,
      description: taskTpl.suffix ? `${plantName}${taskTpl.suffix}.` : null,
      icon:        taskTpl.icon,
      source:      "diary",
      sourceId:    diary.id,
      sortOrder:   order++,
    });
  }

  if (calendarItems.length > 0) {
    const picked = shuffle(calendarItems)[0];
    tasks.push({
      title:       picked.title,
      description: picked.description ?? null,
      icon:        "📅",
      source:      "calendar",
      sourceId:    picked.id,
      sortOrder:   order++,
    });
  }

  // ── 4. Säsongstemplates (fyll upp till 5 totalt) ────────────────────
  const seasonal = SEASONAL_TASKS[month] ?? [];
  const needed   = Math.max(0, 5 - tasks.length);

  // Sortera: priority 1 först, sedan blanda inom varje grupp
  const p1 = shuffle(seasonal.filter((t) => t.priority === 1));
  const p2 = shuffle(seasonal.filter((t) => t.priority === 2));
  const p3 = shuffle(seasonal.filter((t) => t.priority === 3));
  const pool = [...p1, ...p2, ...p3];

  // Hoppa över titlar som redan finns (från påminnelser/dagbok)
  const existingTitles = new Set(tasks.map((t) => t.title.toLowerCase()));
  for (const tpl of pool) {
    if (tasks.length - (reminders.length + diaries.slice(0, 2).length) >= needed) break;
    if (existingTitles.has(tpl.title.toLowerCase())) continue;
    tasks.push({
      title:       tpl.title,
      description: tpl.description,
      icon:        tpl.icon,
      source:      "system",
      sourceId:    null,
      sortOrder:   order++,
    });
    existingTitles.add(tpl.title.toLowerCase());
  }

  // ── 5. Skriv till DB – en batch-insert, skippa dubletter ────────────
  await prisma.weeklyTask.createMany({
    data: tasks.map((task) => ({ profileId, weekYear, weekNumber, ...task })),
    skipDuplicates: true,
  });
}

/** Hämtar veckans uppgifter. Genererar om inga finns ännu. */
export async function getOrGenerateWeeklyTasks(profileId: string) {
  const { weekYear, weekNumber } = getISOWeek(new Date());

  const existing = await prisma.weeklyTask.findMany({
    where:   { profileId, weekYear, weekNumber },
    orderBy: { sortOrder: "asc" },
  });

  if (existing.length === 0) {
    await generateWeeklyTasks(profileId);
    return prisma.weeklyTask.findMany({
      where:   { profileId, weekYear, weekNumber },
      orderBy: { sortOrder: "asc" },
    });
  }

  return existing;
}
