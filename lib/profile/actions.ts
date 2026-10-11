"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { levels, type WorkspaceSettings } from "@/lib/mock-data";

export async function saveProfile(input: {
  displayName: string;
  avatarUrl: string;
  settings: WorkspaceSettings;
}): Promise<{ error?: string }> {
  const user = await requireUser();
  // Server Action arguments remain untrusted despite their TypeScript types.
  if (
    !input ||
    typeof input.displayName !== "string" ||
    !input.displayName.trim() ||
    input.displayName.trim().length > 128
  )
    return { error: "Adın 1–128 karakter olmalı." };
  if (typeof input.avatarUrl !== "string" || input.avatarUrl.length > 2048)
    return { error: "Profil fotoğrafı adresi geçersiz." };
  if (input.avatarUrl) {
    try {
      if (new URL(input.avatarUrl).protocol !== "https:")
        return { error: "Profil fotoğrafı için HTTPS adresi kullan." };
    } catch {
      return {
        error: "Profil fotoğrafı için geçerli bir HTTPS adresi kullan.",
      };
    }
  }
  const value = input.settings;
  if (
    !value ||
    !levels.includes(value.currentLevel) ||
    !levels.includes(value.targetLevel) ||
    !["US", "UK"].includes(value.accent) ||
    !Number.isInteger(value.reviewGoal) ||
    value.reviewGoal < 1 ||
    value.reviewGoal > 200 ||
    !Number.isInteger(value.newLimit) ||
    value.newLimit < 1 ||
    value.newLimit > 50
  )
    return { error: "Seviye ve günlük hedef alanlarını kontrol et." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        display_name: input.displayName.trim(),
        avatar_url: input.avatarUrl || null,
        current_level: value.currentLevel,
        target_level: value.targetLevel,
        daily_new_card_limit: value.newLimit,
        daily_review_goal: value.reviewGoal,
        preferred_accent: value.accent.toLowerCase(),
      })
      .eq("user_id", user.id)
      .select("user_id")
      .single();
    if (error || !data) return { error: "Profil kaydedilemedi. Tekrar dene." };
  } catch {
    return { error: "Profil kaydedilemedi. Bağlantını kontrol et." };
  }
  revalidatePath("/", "layout");
  return {};
}
