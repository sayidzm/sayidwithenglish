import type { Metadata } from "next";
import { Library } from "@/components/workspace/library";

export const metadata: Metadata = { title: "Kütüphane" };

export default function Page() {
  return <Library />;
}
