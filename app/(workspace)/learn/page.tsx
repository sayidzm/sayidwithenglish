import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/layout/placeholder-page";

export const metadata: Metadata = { title: "Öğren" };

export default function Page() {
  return <PlaceholderPage page="learn" />;
}
