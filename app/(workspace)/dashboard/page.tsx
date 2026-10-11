import type { Metadata } from "next";
import { Dashboard } from "@/components/workspace/dashboard";

export const metadata: Metadata = { title: "Ana Sayfa" };

export default function Page() {
  return <Dashboard />;
}
