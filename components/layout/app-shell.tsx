"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { usePrototype } from "@/components/workspace/prototype-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { BottomNavigation } from "./bottom-navigation";
import styles from "./shell.module.css";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { focusMode } = usePrototype();
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <div
        className={styles.shell}
        data-collapsed={collapsed}
        data-focus={pathname === "/review" && focusMode}
      >
        <a href="#main-content" className={styles.skipLink}>
          İçeriğe geç
        </a>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((value) => !value)}
        />
        <div className={styles.workspace}>
          <Topbar />
          <main id="main-content" tabIndex={-1} className={styles.main}>
            {children}
          </main>
        </div>
        <BottomNavigation />
      </div>
    </TooltipProvider>
  );
}
