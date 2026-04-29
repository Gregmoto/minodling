import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { CalendarEntryForm } from "@/components/admin/CalendarEntryForm";
import { updateCalendarEntry } from "@/app/admin/actions";
import { monthFromNum } from "@/lib/calendar";

export const metadata: Metadata = { title: "Redigera kalenderpost | Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function RedigeraKalenderpostPage({ params }: Props) {
  const { id } = await params;
  const entry = await prisma.gardenCalendar.findUnique({ where: { id } });
  if (!entry) notFound();

  const month = monthFromNum(entry.month);

  async function handleUpdate(formData: FormData) {
    "use server";
    await updateCalendarEntry(id, formData);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/kalender"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till kalendern
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redigera kalenderpost</h1>
            <p className="text-sm text-gray-500 mt-1 truncate">{entry.title}</p>
          </div>
          {month && (
            <Link
              href={`/odlingskalender/${month.slug}`}
              target="_blank"
              className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 shrink-0"
            >
              <ExternalLink className="h-4 w-4" />
              Visa månadssida
            </Link>
          )}
        </div>
      </div>

      <Card padding="lg">
        <CalendarEntryForm
          action={handleUpdate}
          submitLabel="Spara ändringar"
          showStatus
          defaultValues={{
            title:       entry.title,
            month:       entry.month,
            taskType:    entry.taskType    ?? "",
            category:    entry.category    ?? "",
            growingZone: entry.growingZone ?? "",
            growingType: entry.growingType ?? "",
            description: entry.description ?? "",
            status:      entry.status,
          }}
        />
      </Card>
    </div>
  );
}
