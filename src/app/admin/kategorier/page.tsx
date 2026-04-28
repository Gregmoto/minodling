import type { Metadata } from "next";
import { Tag } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Kategorier | Admin" };

export default async function AdminCategoriesPage() {
  const categoryGroups = await prisma.post.groupBy({
    by: ["category"],
    where: { category: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kategorier</h1>
        <p className="text-gray-500 text-sm mt-1">{categoryGroups.length} kategorier i användning</p>
      </div>

      <Card padding="none">
        {categoryGroups.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-10 w-10 text-sage-300 mx-auto mb-3" />
            <p className="text-gray-400">Inga kategorier hittades</p>
          </div>
        ) : (
          <div className="divide-y divide-sage-100">
            {categoryGroups.map((group) => (
              <div
                key={group.category}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="font-medium text-gray-900">{group.category}</div>
                <div className="text-sm text-gray-500">{group._count.id} inlägg</div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
