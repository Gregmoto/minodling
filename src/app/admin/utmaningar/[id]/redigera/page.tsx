import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { ChallengeForm } from "@/components/utmaningar/ChallengeForm";

export const metadata: Metadata = { title: "Redigera utmaning | Admin" };

export default async function RedigeraUtmaningPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const challenge = await prisma.challenge.findUnique({
    where: { id },
    select: {
      id: true, title: true, description: true, rules: true,
      category: true, imageUrl: true,
      startDate: true, endDate: true,
      status: true, published: true,
    },
  });

  if (!challenge) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/utmaningar"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Redigera utmaning</h1>
          <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{challenge.title}</p>
        </div>
      </div>

      <Card>
        <ChallengeForm challenge={challenge} />
      </Card>
    </div>
  );
}
