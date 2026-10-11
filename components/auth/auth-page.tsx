import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/redirect";
import type { AuthMode } from "@/lib/auth/state";
import { AuthForm } from "./auth-form";
import s from "./auth.module.css";

const copy = {
  login: ["Tekrar hoş geldin", "Kendi kelimelerinle öğrenmeye devam et."],
  register: [
    "Çalışma alanını oluştur",
    "İngilizceni kendi hayatından topladığın ifadelerle geliştir.",
  ],
  "forgot-password": [
    "Şifreni sıfırla",
    "Email adresine güvenli bir sıfırlama bağlantısı gönderelim.",
  ],
  "reset-password": [
    "Yeni şifreni belirle",
    "Hesabın için güçlü ve farklı bir şifre seç.",
  ],
};
export type AuthSearch = Promise<Record<string, string | string[] | undefined>>;
export function AuthPage({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: AuthSearch;
}) {
  return (
    <main className={s.page}>
      <div className={s.container}>
        <div className={s.brand}>
          <span className={s.monogram} aria-hidden="true">
            S
          </span>
          sayidwithenglish
        </div>
        <Card className={s.panel}>
          <h1 className={s.heading}>{copy[mode][0]}</h1>
          <p className={s.description}>{copy[mode][1]}</p>
          <Suspense
            fallback={
              <p role="status" className={s.notice}>
                Oturum kontrol ediliyor…
              </p>
            }
          >
            <FormContent mode={mode} searchParams={searchParams} />
          </Suspense>
        </Card>
        <p className={s.hint}>Kendi kelimelerinle, daha kalıcı öğren.</p>
      </div>
    </main>
  );
}
async function FormContent({
  mode,
  searchParams,
}: {
  mode: AuthMode;
  searchParams: AuthSearch;
}) {
  const params = await searchParams;
  const user = await getUser();
  const next = safeNext(params.next);
  if (user && (mode === "login" || mode === "register")) redirect(next);
  const messages: Record<string, string> = {
    "signed-out": "Oturumun kapatıldı.",
    "password-updated": "Şifren güncellendi. Yeni şifrenle giriş yap.",
  };
  const message =
    typeof params.message === "string" ? messages[params.message] : undefined;
  return (
    <>
      {params.error === "invalid-link" && (
        <p role="alert" className={`${s.notice} ${s.error}`}>
          Email bağlantısı geçersiz veya süresi dolmuş. Giriş yapmayı ya da yeni
          sıfırlama bağlantısı istemeyi dene.
        </p>
      )}
      <AuthForm
        mode={mode}
        next={next}
        message={message}
        canReset={mode !== "reset-password" || Boolean(user)}
      />
    </>
  );
}
