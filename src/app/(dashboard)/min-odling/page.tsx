import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Sprout, BookOpen, Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Min odling" };

export default async function MinOdlingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      gardenDiaries: {
        orderBy: { createdAt: "desc" },
        include: { plant: { select: { name: true } } },
      },
    },
  });

  if (!profile) redirect("/auth/login");

  const statusLabels: Record<string, { label: string; variant: "success" | "default" | "danger" | "warning" }> = {
    growing:   { label: "Växer",    variant: "success" },
    harvested: { label: "Skördad",  variant: "default" },
    failed:    { label: "Misslyckad", variant: "danger" },
    dormant:   { label: "Vilande",  variant: "warning" },
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Min odling</h1>
          <p className="text-gray-500 text-sm mt-1">Din personliga odlingsdagbok</p>
        </div>
        <Link href="/dagbok/ny">
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Ny odlingspost
          </Button>
        </Link>
      </div>

      {profile.gardenDiaries.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto mb-5">
            <Sprout className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">Starta din odlingsdagbok</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Dokumentera dina planters resa från frö till skörd.
          </p>
          <Link href="/dagbok/ny">
            <Button>
              <Plus className="h-4 w-4" />
              Skapa första odlingsposten
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profile.gardenDiaries.map((diary) => {
            const s = statusLabels[diary.status] ?? { label: diary.status, variant: "default" as const };
            return (
              <Link key={diary.id} href={`/dagbok/${diary.id}`}>
                <Card hover className="h-full">
                  {diary.imageUrl ? (
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-sage-100">
                      <img src={diary.imageUrl} alt={diary.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-green-50 to-sage-100 flex items-center justify-center mb-4">
                      <Sprout className="h-10 w-10 text-green-300" />
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{diary.title}</h3>
                    <Badge variant={s.variant} size="sm">{s.label}</Badge>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    {diary.plant?.name ?? diary.customPlantName ?? "Okänd växt"}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    {diary.sowingDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Sått: {formatDate(diary.sowingDate)}
                      </span>
                    )}
                    {diary.notes && (
                      <span className="flex items-center gap-1 ml-auto">
                        <BookOpen className="h-3 w-3" />
                        Anteckningar
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
