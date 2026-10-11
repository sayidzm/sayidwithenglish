import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Tekrar" };

export default function Page() {
  return <PlaceholderPage page="review" />;
}
