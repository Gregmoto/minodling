import prisma from "./prisma";

export function calcPoints(totalAmountOre: number): number {
  return Math.floor(totalAmountOre / 1000); // 1 poäng per 10 kr
}

export async function awardOrderPoints(
  userId: string,
  orderId: string,
  totalAmountOre: number
): Promise<void> {
  const points = calcPoints(totalAmountOre);
  if (points <= 0) return;
  try {
    await prisma.$transaction([
      prisma.shopLoyaltyTransaction.create({
        data: {
          userId,
          orderId,
          points,
          type: "earn",
          description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
        },
      }),
      prisma.shopLoyaltyBalance.upsert({
        where: { userId },
        update: {
          balance: { increment: points },
          totalEarned: { increment: points },
        },
        create: { userId, balance: points, totalEarned: points, totalSpent: 0 },
      }),
    ]);
    console.log(`[Loyalty] Awarded ${points} points to user ${userId}`);
  } catch (err) {
    console.error("[Loyalty] Failed to award points:", err);
  }
}

export async function getUserBalance(userId: string): Promise<{
  balance: number;
  totalEarned: number;
  totalSpent: number;
} | null> {
  try {
    return (
      (await prisma.shopLoyaltyBalance.findUnique({ where: { userId } })) ?? {
        balance: 0,
        totalEarned: 0,
        totalSpent: 0,
      }
    );
  } catch {
    return null;
  }
}
