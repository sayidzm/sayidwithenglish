import "server-only";
import { cache } from "react";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export const getProfile = cache(async (): Promise<Profile> => {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Profil yüklenemedi. Lütfen tekrar dene.");
  if (data) return data;
  // Fallback for imported/legacy Auth users. ignoreDuplicates avoids overwriting
  // a profile created by a concurrent request or the signup trigger.
  const name: unknown = user.user_metadata.display_name;
  const { error: bootstrapError } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      display_name:
        typeof name === "string" && name.trim()
          ? name.trim().slice(0, 128)
          : "Sayid",
    },
    { onConflict: "user_id", ignoreDuplicates: true },
  );
  if (bootstrapError)
    throw new Error("Profil oluşturulamadı. Lütfen tekrar dene.");
  const result = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (result.error) throw new Error("Profil yüklenemedi. Lütfen tekrar dene.");
  return result.data;
});
