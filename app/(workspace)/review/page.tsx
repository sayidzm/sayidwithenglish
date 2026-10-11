import type { Metadata } from "next";
import { Review } from "@/components/workspace/review";

export const metadata: Metadata = { title: "Tekrar" };

export default function Page() {
  return <Review />;
}
