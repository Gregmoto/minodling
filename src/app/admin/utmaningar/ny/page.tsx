import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { ChallengeForm } from "@/components/utmaningar/ChallengeForm";

export const metadata: Metadata = { title: "Ny utmaning | Admin" };

export default function NyUtmaningPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href="/admin/utmaningar"
          className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ny utmaning</h1>
          <p className="text-sm text-gray-500 mt-0.5">Skapa en ny odlingsutmaning</p>
        </div>
      </div>

      <Card>
        <ChallengeForm />
      </Card>
    </div>
  );
}
