"use client";
import { useActionState } from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";
import { emptyAuthState } from "@/lib/auth/state";
import s from "./auth.module.css";

export function LogoutButton() {
  const [state, action, pending] = useActionState(logout, emptyAuthState);
  return (
    <form action={action} className={s.logout}>
      <Button type="submit" variant="secondary" size="small" disabled={pending}>
        <LogOut size={16} />
        {pending ? "Çıkış yapılıyor…" : "Çıkış yap"}
      </Button>
      {state.error && (
        <p role="alert" className={`${s.notice} ${s.error}`}>
          {state.error}
        </p>
      )}
    </form>
  );
}
