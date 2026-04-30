import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { PlantForm } from "@/components/admin/PlantForm";
import { updatePlant } from "@/app/admin/actions";

export const metadata: Metadata = { title: "Redigera växt | Admin" };

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RedigeraVaxtPage({ params }: Props) {
  const { id } = await params;

  const plant = await prisma.plant.findUnique({ where: { id } });
  if (!plant) notFound();

  async function handleUpdate(formData: FormData) {
    "use server";
    await updatePlant(id, formData);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link
          href="/admin/vaxter"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Tillbaka till växtdatabasen
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Redigera: {plant.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Slug: <code className="bg-gray-100 px-1 rounded">{plant.slug}</code>
            </p>
          </div>
          <Link
            href={`/vaxtdatabas/${plant.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
            Visa sida
          </Link>
        </div>
      </div>

      <Card padding="lg">
        <PlantForm
          action={handleUpdate}
          submitLabel="Spara ändringar"
          defaultValues={{
            name:            plant.name,
            slug:            plant.slug,
            latinName:       plant.latinName       ?? "",
            imageUrl:        plant.imageUrl        ?? "",
            category:        plant.category        ?? "",
            difficultyLevel: plant.difficultyLevel ?? "",
            sowingPeriod:    plant.sowingPeriod    ?? "",
            plantingPeriod:  plant.plantingPeriod  ?? "",
            harvestPeriod:   plant.harvestPeriod   ?? "",
            sunRequirement:  plant.sunRequirement  ?? "",
            wateringNeeds:   plant.wateringNeeds   ?? "",
            soilType:        plant.soilType        ?? "",
            fertilizerNeeds:  plant.fertilizerNeeds  ?? "",
            soilPreparation:  plant.soilPreparation  ?? "",
            locationNotes:    plant.locationNotes    ?? "",
            commonProblems:   plant.commonProblems   ?? "",
            description:     plant.description     ?? "",
            seoTitle:        plant.seoTitle        ?? "",
            seoDescription:  plant.seoDescription  ?? "",
          }}
        />
      </Card>
    </div>
  );
}
