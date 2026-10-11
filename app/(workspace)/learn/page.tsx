import type { Metadata } from "next";
import { Learn } from "@/components/workspace/learn";
import { getLearnData } from "@/lib/review/learn";

export const metadata: Metadata = { title: "Öğren" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  return <Learn data={await getLearnData()} />;
}
