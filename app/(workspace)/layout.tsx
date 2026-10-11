import { AppShell } from "@/components/layout/app-shell";
import { PrototypeProvider } from "@/components/workspace/prototype-provider";
import { Suspense } from "react";
import { getProfile } from "@/lib/profile/profile";
import { initialSettings, levels, type Level } from "@/lib/mock-data";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Suspense
      fallback={
        <p role="status" style={{ padding: 32 }}>
          Çalışma alanı yükleniyor…
        </p>
      }
    >
      <AuthenticatedWorkspace>{children}</AuthenticatedWorkspace>
    </Suspense>
  );
}
async function AuthenticatedWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getProfile();
  const level = (value: string, fallback: Level) =>
    levels.includes(value as Level) ? (value as Level) : fallback;
  const preferences = {
    ...initialSettings,
    currentLevel: level(profile.current_level, "B1"),
    targetLevel: level(profile.target_level, "B2"),
    reviewGoal: profile.daily_review_goal,
    newLimit: profile.daily_new_card_limit,
    accent:
      profile.preferred_accent === "uk" ? ("UK" as const) : ("US" as const),
  };
  return (
    <PrototypeProvider initialPreferences={preferences}>
      <AppShell displayName={profile.display_name}>{children}</AppShell>
    </PrototypeProvider>
  );
}
