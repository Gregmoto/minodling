import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * React cache() deduplicates this call across all server components
 * in the same request — even across Suspense boundaries.
 * So multiple async components calling getRequestUser() only hit
 * Supabase auth once per page render.
 */
export const getRequestUser = cache(async () => {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user ?? null;
  } catch {
    return null;
  }
});
