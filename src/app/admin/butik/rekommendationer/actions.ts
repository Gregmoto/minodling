"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

async function auth() {
  await requireAdmin();
}

export async function createRule(data: {
  productId:   string;
  plantId:     string | null;
  problemType: string | null;
  symptom:     string | null;
  priority:    number;
  isActive:    boolean;
}) {
  await auth();
  await prisma.shopProductRecommendationRule.create({ data: {
    productId:   data.productId,
    plantId:     data.plantId   || undefined,
    problemType: data.problemType || undefined,
    symptom:     data.symptom   || undefined,
    priority:    data.priority,
    isActive:    data.isActive,
  }});
  revalidatePath("/admin/butik/rekommendationer");
}

export async function updateRule(id: string, data: {
  productId:   string;
  plantId:     string | null;
  problemType: string | null;
  symptom:     string | null;
  priority:    number;
  isActive:    boolean;
}) {
  await auth();
  await prisma.shopProductRecommendationRule.update({
    where: { id },
    data: {
      productId:   data.productId,
      plantId:     data.plantId   || null,
      problemType: data.problemType || null,
      symptom:     data.symptom   || null,
      priority:    data.priority,
      isActive:    data.isActive,
    },
  });
  revalidatePath("/admin/butik/rekommendationer");
}

export async function deleteRule(id: string) {
  await auth();
  await prisma.shopProductRecommendationRule.delete({ where: { id } });
  revalidatePath("/admin/butik/rekommendationer");
}

export async function toggleRule(id: string, isActive: boolean) {
  await auth();
  await prisma.shopProductRecommendationRule.update({
    where: { id },
    data:  { isActive },
  });
  revalidatePath("/admin/butik/rekommendationer");
}
