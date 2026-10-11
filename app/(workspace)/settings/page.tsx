import type { Metadata } from "next";
import { Settings } from "@/components/workspace/settings";
import { getProfile } from "@/lib/profile/profile";
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
  return <Settings profile={await getProfile()} />;
}
