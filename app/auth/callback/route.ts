import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/auth/redirect";
import { appOrigin } from "@/lib/auth/origin";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const code = params.get("code");
  const token = params.get("token_hash");
  const type = params.get("type");
  const next =
    type === "recovery" || params.get("next") === "/reset-password"
      ? "/reset-password"
      : safeNext(params.get("next"));
  let valid = false;
  try {
    const supabase = await createClient();
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      valid = !error;
    } else if (
      token &&
      (type === "signup" || type === "recovery" || type === "email")
    ) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type,
      });
      valid = !error;
    }
  } catch {
    /* A malformed/expired link must not render a raw provider error. */
  }
  const target = valid ? next : "/login?error=invalid-link";
  const response = NextResponse.redirect(new URL(target, appOrigin()));
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
