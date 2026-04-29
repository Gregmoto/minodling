import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PlantForm } from "@/components/admin/PlantForm";
import { createPlant } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Ny växt | Admin" };

export default function NyVaxtPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/vaxter"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till växtdatabasen
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Lägg till växt</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fyll i informationen nedan och publicera direkt.
        </p>
      </div>

      <Card padding="lg">
        <PlantForm action={createPlant} submitLabel="Skapa växt" />
      </Card>
    </div>
  );
}
