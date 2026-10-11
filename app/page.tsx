import { redirect } from "next/navigation";

// Redirect instant UI üretmez; segment validasyonundan muaf tutulur.
export const instant = false;

export default function Home() {
  redirect("/dashboard");
}
