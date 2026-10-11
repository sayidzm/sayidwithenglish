"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogoutButton } from "@/components/auth/logout-button";
import s from "@/components/auth/auth.module.css";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className={s.page}>
      <Card className={`${s.container} ${s.panel}`}>
        <h1 className={s.heading}>Çalışma alanı yüklenemedi</h1>
        <p className={s.description}>
          Bağlantını kontrol edip tekrar dene. Sorun sürerse çıkış yapıp yeniden
          giriş yap.
        </p>
        <div className={s.form}>
          <Button onClick={reset}>Tekrar dene</Button>
          <LogoutButton />
        </div>
      </Card>
    </main>
  );
}
