import type { Metadata } from "next";
import { AuthPage, type AuthSearch } from "@/components/auth/auth-page";
export const metadata: Metadata = { title: "Kayıt ol" };
export default function Page({ searchParams }: { searchParams: AuthSearch }) {
  return <AuthPage mode="register" searchParams={searchParams} />;
}
