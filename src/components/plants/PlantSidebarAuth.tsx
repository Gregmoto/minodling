import { getRequestUser } from "@/lib/auth-cache";
import prisma from "@/lib/prisma";
import { PlantSidebarStatus } from "./PlantSidebarStatus";

interface Props {
  plantId: string;
  difficultyLevel?: string | null;
}

/**
 * Async server component – checks if the current user is growing this plant.
 * Meant to be used inside a <Suspense> boundary.
 */
export async function PlantSidebarAuth({ plantId, difficultyLevel }: Props) {
  const user = await getRequestUser();
  let isGrowing = false;

  if (user) {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (profile) {
      isGrowing = await prisma.gardenDiary
        .count({ where: { userId: profile.id, plantId, status: "growing" } })
        .then((n) => n > 0);
    }
  }

  return (
    <PlantSidebarStatus
      difficultyLevel={difficultyLevel}
      initialGrowing={isGrowing}
    />
  );
}
