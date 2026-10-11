import type { Metadata } from "next";
import { Statistics } from "@/components/workspace/statistics";

export const metadata: Metadata = { title: "İstatistikler" };

export default function Page() {
  return <Statistics />;
}
