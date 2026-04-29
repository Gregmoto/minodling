export const dynamic = "force-dynamic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { GlossaryTermForm } from "@/components/admin/GlossaryTermForm";

export const metadata: Metadata = { title: "Redigera term | Admin" };

interface Props { params: Promise<{ id: string }> }

export default async function RedigeraTermPage({ params }: Props) {
  const { id } = await params;
  const term = await prisma.glossaryTerm.findUnique({ where: { id } });
  if (!term) notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/ordlista" className="text-gray-500 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Redigera term</h1>
        </div>
        {term.published && (
          <Link href={`/ordlista/${term.slug}`} target="_blank"
            className="flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 transition-colors">
            <ExternalLink className="h-4 w-4" /> Visa live
          </Link>
        )}
      </div>
      <Card>
        <GlossaryTermForm term={term} />
      </Card>
    </div>
  );
}
