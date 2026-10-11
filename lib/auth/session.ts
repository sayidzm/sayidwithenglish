import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Request-scoped memoization, not a cross-user/session cache. */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  return error ? null : data.user;
});
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}
