import type { Metadata } from "next";
import { Settings } from "@/components/workspace/settings";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return <Settings />;
}
