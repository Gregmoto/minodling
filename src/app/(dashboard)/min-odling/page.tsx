import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Sprout, BookOpen, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Min odling" };

export default async function MinOdlingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
    include: {
      gardens: {
        include: {
          plants: true,
          _count: { select: { logs: true, plants: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!profile) redirect("/auth/login");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Min odling</h1>
          <p className="text-gray-500 text-sm mt-1">
            Din personliga trädgårdsdagbok
          </p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Ny odling
        </Button>
      </div>

      {/* Odlingsytor */}
      {profile.gardens.length === 0 ? (
        <Card className="text-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 mx-auto mb-5">
            <Sprout className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="font-semibold text-gray-900 mb-2">
            Starta din odlingsdagbok
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
            Skapa din första odlingsyta och börja dokumentera dina planters resa
            från frö till skörd.
          </p>
          <Button>
            <Plus className="h-4 w-4" />
            Skapa min första odling
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {profile.gardens.map((garden) => (
            <Link key={garden.id} href={`/min-odling/${garden.id}`}>
              <Card hover className="h-full">
                {garden.coverImage ? (
                  <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-sage-100">
                    <img
                      src={garden.coverImage}
                      alt={garden.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-green-50 to-sage-100 flex items-center justify-center mb-4">
                    <Sprout className="h-10 w-10 text-green-300" />
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{garden.name}</h3>
                  {!garden.isPublic && (
                    <Badge variant="outline" size="sm">Privat</Badge>
                  )}
                </div>

                {garden.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                    {garden.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Sprout className="h-3 w-3" />
                    {garden._count.plants} växter
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {garden._count.logs} loggposter
                  </span>
                  <span className="flex items-center gap-1 ml-auto">
                    <Calendar className="h-3 w-3" />
                    {formatDate(garden.createdAt)}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
