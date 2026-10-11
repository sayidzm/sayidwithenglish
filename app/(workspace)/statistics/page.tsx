import type { Metadata } from "next";
import { Statistics } from "@/components/workspace/statistics";
import { getAnalytics } from "@/lib/analytics/queries";

export const metadata: Metadata = { title: "İstatistikler" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  return <Statistics analytics={await getAnalytics()} />;
}
