"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  login,
  register,
  forgotPassword,
  resetPassword,
} from "@/lib/auth/actions";
import {
  emptyAuthState,
  type AuthField,
  type AuthMode,
} from "@/lib/auth/state";
import s from "./auth.module.css";

const actions = {
  login,
  register,
  "forgot-password": forgotPassword,
  "reset-password": resetPassword,
};
const labels = {
  login: "Giriş yap",
  register: "Hesap oluştur",
  "forgot-password": "Sıfırlama bağlantısı gönder",
  "reset-password": "Şifreyi güncelle",
};
export function AuthForm({
  mode,
  next,
  message,
  canReset = true,
}: {
  mode: AuthMode;
  next: string;
  message?: string;
  canReset?: boolean;
}) {
  const [values, setValues] = useState<Record<AuthField, string>>({
    email: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });
  const [state, action, pending] = useActionState(
    actions[mode],
    emptyAuthState,
  );
  const hasPassword = mode !== "forgot-password";
  const newPassword = mode === "register" || mode === "reset-password";
  const field = (
    name: AuthField,
    label: string,
    type: string,
    autocomplete: string,
  ) => (
    <div className={s.field}>
      <label htmlFor={name}>{label}</label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autocomplete}
        value={values[name]}
        onChange={(event) =>
          setValues((current) => ({ ...current, [name]: event.target.value }))
        }
        required
        disabled={pending || !canReset}
        minLength={type === "password" && newPassword ? 8 : undefined}
        maxLength={name === "email" ? 254 : 128}
        aria-invalid={Boolean(state.fields?.[name])}
        aria-describedby={state.fields?.[name] ? `${name}-error` : undefined}
      />
      {state.fields?.[name] && (
        <span id={`${name}-error`} className={s.fieldError}>
          {state.fields[name]}
        </span>
      )}
    </div>
  );
  return (
    <>
      <form action={action} className={s.form} aria-busy={pending}>
        <input type="hidden" name="next" value={next} />
        {message && (
          <p className={`${s.notice} ${s.success}`} role="status">
            {message}
          </p>
        )}
        {!canReset && (
          <p className={`${s.notice} ${s.error}`} role="alert">
            Sıfırlama bağlantısı geçersiz veya süresi dolmuş. Yeni bir bağlantı
            iste.
          </p>
        )}
        {state.error && (
          <p className={`${s.notice} ${s.error}`} role="alert">
            {state.error}
          </p>
        )}
        {state.success && (
          <p className={`${s.notice} ${s.success}`} role="status">
            {state.success}
          </p>
        )}
        {state.fields && (
          <p className="sr-only" role="alert">
            Formdaki hatalı alanları kontrol et.
          </p>
        )}
        {mode === "register" && field("displayName", "Adın", "text", "name")}
        {mode !== "reset-password" && field("email", "Email", "email", "email")}
        {hasPassword &&
          field(
            "password",
            newPassword ? "Yeni şifre" : "Şifre",
            "password",
            newPassword ? "new-password" : "current-password",
          )}
        {newPassword && (
          <p className={s.field}>En az 8 karakter, bir harf ve bir rakam.</p>
        )}
        {newPassword &&
          field(
            "confirmPassword",
            "Şifreyi tekrar yaz",
            "password",
            "new-password",
          )}
        <Button
          type="submit"
          className={s.submit}
          disabled={pending || !canReset}
        >
          {pending ? (
            <LoaderCircle size={16} aria-hidden="true" />
          ) : (
            <ArrowRight size={16} aria-hidden="true" />
          )}
          {pending ? "İşlem sürüyor…" : labels[mode]}
        </Button>
      </form>
      <div className={s.links}>
        {mode === "login" ? (
          <>
            <Link href="/register">Hesap oluştur</Link>
            <Link href="/forgot-password">Şifremi unuttum</Link>
          </>
        ) : (
          <Link href="/login">Girişe dön</Link>
        )}
        {mode === "reset-password" && !canReset && (
          <Link href="/forgot-password">Yeni bağlantı iste</Link>
        )}
      </div>
    </>
  );
}
