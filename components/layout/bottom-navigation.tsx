"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { isActiveRoute, mobileNavigation } from "@/lib/navigation";
import styles from "./shell.module.css";

export function BottomNavigation() {
  const pathname = usePathname();
  return <nav className={styles.bottomNav} aria-label="Mobil navigasyon">
    {mobileNavigation.map(({ id, href, mobileLabel, icon: Icon }) => <Link key={id} href={href}
      className={cn(styles.bottomNavItem, id === "add" && styles.bottomNavAdd)}
      aria-label={id === "add" ? "Yeni kayıt ekle" : mobileLabel}
      aria-current={isActiveRoute(pathname, href) ? "page" : undefined}>
      <span className={styles.bottomIcon}><Icon aria-hidden="true" size={20} strokeWidth={1.75} /></span>
      <span>{mobileLabel}</span>
    </Link>)}
  </nav>;
}
