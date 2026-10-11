import type { Metadata } from "next";
import { Tutor } from "@/components/workspace/tutor";

export const metadata: Metadata = { title: "AI Tutor" };

export default function Page() {
  return <Tutor />;
}
