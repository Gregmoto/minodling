import type { Metadata } from "next";
import { Tag, Plus, GripVertical } from "lucide-react";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export const metadata: Metadata = { title: "Kategorier | Admin" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { posts: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategorier</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} kategorier</p>
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Ny kategori
        </Button>
      </div>

      <Card padding="none">
        {categories.length === 0 ? (
          <div className="text-center py-16">
            <Tag className="h-10 w-10 text-sage-300 mx-auto mb-3" />
            <p className="text-gray-400 mb-4">Inga kategorier skapade</p>
            <Button variant="outline" size="sm">Skapa första kategorin</Button>
          </div>
        ) : (
          <div className="divide-y divide-sage-100">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-sage-50 transition-colors"
              >
                <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />
                <div
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{cat.name}</div>
                  {cat.description && (
                    <div className="text-xs text-gray-400 mt-0.5">{cat.description}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">{cat._count.posts} inlägg</div>
                <Badge variant={cat.isActive ? "success" : "default"} size="sm">
                  {cat.isActive ? "Aktiv" : "Dold"}
                </Badge>
                <Button variant="ghost" size="sm">Redigera</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
