import type { Metadata } from "next";
import { Library } from "@/components/workspace/library";
import { listVocabularyEntries } from "@/lib/vocabulary/queries";

export const metadata: Metadata = { title: "Kütüphane" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ entry?: string | string[] }>;
}) {
  const [{ entries, error }, params] = await Promise.all([
    listVocabularyEntries(),
    searchParams,
  ]);
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const weekStart = new Date(now.getTime() - 6 * 86_400_000).toISOString().slice(0, 10);
  const selectedId = typeof params.entry === "string" ? params.entry : null;
  return <Library key={selectedId || "library"} initialEntries={entries} loadError={error}
    initialSelectedId={selectedId}
    today={today} weekStart={weekStart} />;
}
