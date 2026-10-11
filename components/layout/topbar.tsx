"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Plus, Search } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownLabel,
  DropdownMessage,
  DropdownSeparator,
} from "@/components/ui/dropdown";
import { Tooltip } from "@/components/ui/tooltip";
import { isActiveRoute, navigation } from "@/lib/navigation";
import { CommandPalette } from "./command-palette";
import styles from "./shell.module.css";

export function Topbar({ displayName }: { displayName: string }) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const searchRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  function openPalette() {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : searchRef.current;
    setPaletteOpen(true);
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (!paletteOpen) {
          returnFocusRef.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : searchRef.current;
        }
        setPaletteOpen(!paletteOpen);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [paletteOpen]);

  return (
    <header className={styles.topbar}>
      <div className={styles.mobileMenu}>
        <Dropdown
          label="Tüm sayfalar"
          trigger={
            <Button
              variant="ghost"
              className={styles.iconButton}
              aria-label="Tüm sayfaları aç"
              title="Tüm sayfalar"
            >
              <Menu aria-hidden="true" />
            </Button>
          }
        >
          <DropdownLabel>sayidwithenglish</DropdownLabel>
          <DropdownSeparator />
          {navigation.map(({ href, label, icon: Icon }) => (
            <DropdownItem key={href} asChild>
              <Link
                href={href}
                aria-current={
                  isActiveRoute(pathname, href) ? "page" : undefined
                }
              >
                <Icon aria-hidden="true" />
                {label}
              </Link>
            </DropdownItem>
          ))}
        </Dropdown>
      </div>
      <button
        ref={searchRef}
        type="button"
        className={styles.searchTrigger}
        onClick={openPalette}
        aria-label="Arama ve hızlı erişimi aç"
        aria-haspopup="dialog"
        aria-expanded={paletteOpen}
      >
        <Search size={18} strokeWidth={1.75} aria-hidden="true" />
        <span className={styles.searchPlaceholder}>
          Kelime, ifade veya cümle ara...
        </span>
        <span className={styles.mobileSearchPlaceholder}>Ara...</span>
        <kbd className={styles.shortcut}>Ctrl / ⌘ K</kbd>
      </button>
      <div className={styles.topbarActions}>
        <ButtonLink href="/add" size="small" className={styles.topbarAdd}>
          <Plus aria-hidden="true" />
          Ekle
        </ButtonLink>
        <Dropdown
          label="Bildirimler"
          trigger={
            <Button
              variant="ghost"
              className={styles.iconButton}
              aria-label="Bildirimleri aç"
              title="Bildirimler"
            >
              <Bell aria-hidden="true" />
            </Button>
          }
        >
          <DropdownLabel>Bildirimler</DropdownLabel>
          <DropdownSeparator />
          <DropdownMessage>Henüz bildirimin yok.</DropdownMessage>
        </Dropdown>
        <Tooltip label="Profil ve ayarlar">
          <Link
            href="/settings"
            className={styles.avatarButton}
            aria-label="Profil ve ayarlar"
          >
            <span className={styles.avatar} aria-hidden="true">
              {displayName.trim().charAt(0).toLocaleUpperCase("tr-TR")}
            </span>
          </Link>
        </Tooltip>
      </div>
      <CommandPalette
        key={String(paletteOpen)}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        returnFocusRef={returnFocusRef}
      />
    </header>
  );
}
