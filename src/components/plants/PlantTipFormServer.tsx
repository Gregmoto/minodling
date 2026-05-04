import Link from "next/link";
import { getRequestUser } from "@/lib/auth-cache";
import { PlantTipForm } from "./PlantTipForm";
import { cn } from "@/lib/utils";

interface Props {
  plantId: string;
  plantSlug: string;
  plantName: string;
  hasTips: boolean;
}

/**
 * Async server component – renders the tip form for logged-in users,
 * or a login prompt otherwise. Meant to be used inside a <Suspense> boundary.
 */
export async function PlantTipFormServer({ plantId, plantSlug, plantName, hasTips }: Props) {
  const user = await getRequestUser();

  if (!user) {
    return (
      <div className={cn("text-center py-6 bg-green-50 rounded-xl", hasTips && "mt-4")}>
        <p className="text-sm text-green-700">
          <Link
            href={`/auth/login?redirect=/vaxtdatabas/${plantSlug}`}
            className="font-medium underline"
          >
            Logga in
          </Link>{" "}
          för att dela ditt eget tips
        </p>
      </div>
    );
  }

  return (
    <div className={cn("pt-2", hasTips && "border-t border-gray-100")}>
      <p className="text-sm text-gray-500 mb-3">Dela ditt tips om {plantName}:</p>
      <PlantTipForm plantId={plantId} />
    </div>
  );
}
