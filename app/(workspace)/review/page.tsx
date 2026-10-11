import type { Metadata } from "next";
import { Review } from "@/components/workspace/review";
import { getReviewQueue } from "@/lib/review/queries";

export const metadata: Metadata = { title: "Tekrar" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  const queue = await getReviewQueue();
  return <Review initialQueue={queue} />;
}
