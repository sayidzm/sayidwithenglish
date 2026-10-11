"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "./session";
import { appOrigin } from "./origin";
import { safeNext } from "./redirect";
import { authError } from "./errors";
import { readText, validateAuth, type AuthState } from "./state";

export async function login(
  _state: AuthState,
  form: FormData,
): Promise<AuthState> {
  const fields = validateAuth("login", form);
  if (fields) return { fields };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: readText(form, "email").trim(),
      password: readText(form, "password"),
    });
    if (error) return { error: authError(error) };
  } catch {
    return { error: authError(null) };
  }
  revalidatePath("/", "layout");
  redirect(safeNext(readText(form, "next")));
}
export async function register(
  _state: AuthState,
  form: FormData,
): Promise<AuthState> {
  const fields = validateAuth("register", form);
  if (fields) return { fields };
  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: readText(form, "email").trim(),
      password: readText(form, "password"),
      options: {
        data: { display_name: readText(form, "displayName").trim() },
        emailRedirectTo: `${appOrigin()}/auth/callback`,
      },
    });
    if (error) return { error: authError(error) };
    signedIn = Boolean(data.session);
  } catch {
    return { error: authError(null) };
  }
  if (signedIn) {
    revalidatePath("/", "layout");
    redirect("/dashboard");
  }
  return {
    success:
      "Kayıt isteğin alındı. Email adresini doğrulamak için gelen kutunu kontrol et.",
  };
}
export async function forgotPassword(
  _state: AuthState,
  form: FormData,
): Promise<AuthState> {
  const fields = validateAuth("forgot-password", form);
  if (fields) return { fields };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      readText(form, "email").trim(),
      { redirectTo: `${appOrigin()}/auth/callback?next=/reset-password` },
    );
    if (error) return { error: authError(error) };
  } catch {
    return { error: authError(null) };
  }
  return {
    success:
      "Bu adresle bir hesabın varsa şifre sıfırlama bağlantısı gönderildi. Gelen kutunu ve spam klasörünü kontrol et.",
  };
}
export async function resetPassword(
  _state: AuthState,
  form: FormData,
): Promise<AuthState> {
  const fields = validateAuth("reset-password", form);
  if (fields) return { fields };
  if (!(await getUser()))
    return {
      error:
        "Bağlantı geçersiz veya süresi dolmuş. Yeni bir sıfırlama bağlantısı iste.",
    };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      password: readText(form, "password"),
    });
    if (error) return { error: authError(error) };
    const { error: logoutError } = await supabase.auth.signOut({
      scope: "local",
    });
    if (logoutError)
      return {
        error:
          "Şifren güncellendi; oturum kapatılamadı. Tekrar çıkış yapmayı dene.",
      };
  } catch {
    return { error: authError(null) };
  }
  revalidatePath("/", "layout");
  redirect("/login?message=password-updated");
}
export async function logout(): Promise<AuthState> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) return { error: authError(error) };
  } catch {
    return { error: authError(null) };
  }
  revalidatePath("/", "layout");
  redirect("/login?message=signed-out");
}
