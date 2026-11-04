import type { SupabaseClient } from "@supabase/supabase-js";

export const NEIGHBOR_EMAIL = "somsiad@local.pl";

export async function findFamily(client: SupabaseClient, userId: string) {
  return client.from("family_members")
    .select("family_id")
    .eq("user_id", userId)
    .order("family_id")
    .limit(1)
    .maybeSingle();
}
