import type { Metadata } from "next";
import { Tutor } from "@/components/workspace/tutor";
import { getTutorContext } from "@/lib/tutor/context";

export const metadata: Metadata = { title: "AI Tutor" };

// User-specific Supabase verisi uncached okunur; instant navigasyon beklenmez.
export const instant = false;

export default async function Page() {
  return <Tutor context={await getTutorContext()} />;
}
