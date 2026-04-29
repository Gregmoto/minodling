import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CalendarEntryForm } from "@/components/admin/CalendarEntryForm";
import { createCalendarEntry } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Ny kalenderpost | Admin" };

export default function NyKalenderpostPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link
          href="/admin/kalender"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till kalendern
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Lägg till kalenderpost</h1>
        <p className="text-sm text-gray-500 mt-1">Publiceras direkt i odlingskalendern.</p>
      </div>
      <Card padding="lg">
        <CalendarEntryForm action={createCalendarEntry} submitLabel="Skapa post" />
      </Card>
    </div>
  );
}
