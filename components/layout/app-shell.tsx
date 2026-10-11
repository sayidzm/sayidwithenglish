"use client";

import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNavigation } from "./bottom-navigation";
import styles from "./shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return <TooltipProvider>
    <div className={styles.shell} data-collapsed={collapsed}>
      <a href="#main-content" className={styles.skipLink}>İçeriğe geç</a>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <div className={styles.workspace}>
        <Topbar />
        <main id="main-content" tabIndex={-1} className={styles.main}>{children}</main>
      </div>
      <BottomNavigation />
    </div>
  </TooltipProvider>;
}
