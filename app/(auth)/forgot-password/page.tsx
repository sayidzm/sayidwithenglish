import type { Metadata } from "next";
import { AuthPage, type AuthSearch } from "@/components/auth/auth-page";
export const metadata: Metadata = { title: "Şifremi unuttum" };
export default function Page({ searchParams }: { searchParams: AuthSearch }) {
  return <AuthPage mode="forgot-password" searchParams={searchParams} />;
}
