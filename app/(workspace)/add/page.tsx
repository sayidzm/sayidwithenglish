import type { Metadata } from "next";
import { Add } from "@/components/workspace/add";
import { latestVocabularyJob } from "@/lib/ai/jobs";

export const metadata: Metadata = { title: "Ekle" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  const latest = await latestVocabularyJob();
  return <Add initialJob={latest} />;
}
