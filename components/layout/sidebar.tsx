"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/cn";
import { isActiveRoute, navigation } from "@/lib/navigation";
import styles from "./shell.module.css";

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();
  const CollapseIcon = collapsed ? PanelLeftOpen : PanelLeftClose;
  const collapseLabel = collapsed ? "Kenar çubuğunu genişlet" : "Kenar çubuğunu daralt";
  return <aside className={styles.sidebar} aria-label="Kenar çubuğu">
    <Link href="/dashboard" className={styles.brand} aria-label="sayidwithenglish ana sayfa" title="sayidwithenglish">
      <span className={styles.monogram} aria-hidden="true">S</span>
      <span className={styles.brandName}>sayidwithenglish</span>
    </Link>
    <nav id="sidebar-navigation" className={styles.sidebarNav} aria-label="Ana navigasyon">
      {navigation.map(({ href, label, icon: Icon, id }) => <Tooltip key={id} label={label} side="right">
        <Link href={href} aria-label={label} aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
          className={cn(styles.navItem, id === "settings" && styles.settingsItem)}>
          <Icon aria-hidden="true" size={18} strokeWidth={1.75} />
          <span className={styles.navLabel}>{label}</span>
        </Link>
      </Tooltip>)}
    </nav>
    <div className={styles.sidebarFooter}>
      <Link href="/settings" className={styles.profile} aria-label="Sayid, profil ve ayarlar" title="Profil ve ayarlar">
        <span className={styles.avatar} aria-hidden="true">S</span>
        <span className={styles.profileCopy}><span>Sayid</span><span className={styles.profileDescription}>Kişisel çalışma alanı</span></span>
      </Link>
      <Tooltip label={collapseLabel} side="right">
        <Button variant="ghost" className={styles.collapseButton} onClick={onToggle} aria-label={collapseLabel}
          aria-expanded={!collapsed} aria-controls="sidebar-navigation"><CollapseIcon aria-hidden="true" /></Button>
      </Tooltip>
    </div>
  </aside>;
}
