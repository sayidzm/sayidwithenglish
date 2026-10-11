import type { Metadata } from "next";
import { Dashboard } from "@/components/workspace/dashboard";
import { getAnalytics } from "@/lib/analytics/queries";
import { listVocabularyEntries } from "@/lib/vocabulary/queries";

export const metadata: Metadata = { title: "Ana Sayfa" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  const [analytics, vocabulary] = await Promise.all([getAnalytics(), listVocabularyEntries()]);
  return <Dashboard analytics={analytics} entries={vocabulary.entries} />;
}
