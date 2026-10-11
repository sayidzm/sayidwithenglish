import type { Metadata } from "next";
import { Settings } from "@/components/workspace/settings";
import { getProfile } from "@/lib/profile/profile";
import { requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { defaultCardTypes } from "@/lib/review/cards";
import { Suspense } from "react";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return (
    <Suspense fallback={<p role="status">Profil yükleniyor…</p>}>
      <ProfileSettings />
    </Suspense>
  );
}
async function ProfileSettings() {
  const [profile, user, client] = await Promise.all([getProfile(), requireUser(), createClient()]);
  const { data, error } = await client.from("learning_preferences")
    .select("enabled_card_types").eq("user_id", user.id).maybeSingle();
  if (error) throw new Error("Kart tercihleri yüklenemedi.");
  return <Settings profile={profile}
    enabledCardTypes={data?.enabled_card_types || [...defaultCardTypes]} />;
}
