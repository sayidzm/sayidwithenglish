import type { Metadata } from "next";
import { Add } from "@/components/workspace/add";

export const metadata: Metadata = { title: "Ekle" };

export default function Page() {
  return <Add />;
}
