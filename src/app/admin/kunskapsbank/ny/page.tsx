import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const metadata: Metadata = { title: "Ny artikel | Admin" };

export default function NyArtikelPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/kunskapsbank" className="text-gray-500 hover:text-gray-700 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Ny kunskapsartikel</h1>
      </div>
      <Card>
        <ArticleForm />
      </Card>
    </div>
  );
}
