export type AuthMode =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password";
export type AuthField =
  | "email"
  | "password"
  | "confirmPassword"
  | "displayName";
export type AuthState = {
  error?: string;
  success?: string;
  fields?: Partial<Record<AuthField, string>>;
};
export const emptyAuthState: AuthState = {};

export function readText(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}
export function validateAuth(
  mode: AuthMode,
  form: FormData,
): AuthState["fields"] {
  const fields: NonNullable<AuthState["fields"]> = {};
  const email = readText(form, "email").trim();
  const password = readText(form, "password");
  if (
    mode !== "reset-password" &&
    (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254)
  )
    fields.email = "Geçerli bir email adresi yaz.";
  if (mode !== "forgot-password") {
    if (!password || password.length > 128)
      fields.password = "Şifreni yaz (en fazla 128 karakter).";
    if (
      mode !== "login" &&
      (password.length < 8 ||
        !/[a-zA-Z]/.test(password) ||
        !/\d/.test(password))
    )
      fields.password = "En az 8 karakter, bir harf ve bir rakam kullan.";
  }
  if (mode === "register") {
    const name = readText(form, "displayName").trim();
    if (!name || name.length > 128)
      fields.displayName = "Adını yaz (en fazla 128 karakter).";
  }
  if (
    (mode === "register" || mode === "reset-password") &&
    password !== readText(form, "confirmPassword")
  )
    fields.confirmPassword = "Şifreler eşleşmiyor.";
  return Object.keys(fields).length ? fields : undefined;
}
