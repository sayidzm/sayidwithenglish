import type { Metadata } from "next";
import { Learn } from "@/components/workspace/learn";

export const metadata: Metadata = { title: "Öğren" };

export default function Page() {
  return <Learn />;
}
