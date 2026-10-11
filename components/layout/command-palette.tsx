"use client";

import Link from "next/link";
import { useRef, useState, type RefObject } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { navigation } from "@/lib/navigation";
import styles from "./shell.module.css";

export function CommandPalette({ open, onOpenChange, returnFocusRef }: {
  open: boolean; onOpenChange: (open: boolean) => void; returnFocusRef: RefObject<HTMLElement | null>;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);
  const matches = navigation.filter(({ label }) => label.toLocaleLowerCase("tr").includes(query.trim().toLocaleLowerCase("tr")));

  return <Dialog open={open} onOpenChange={onOpenChange} title="Hızlı erişim" description="Bir sayfa ara ve çalışma alanında gezin." returnFocusRef={returnFocusRef} initialFocusRef={inputRef}>
    <div className={styles.paletteSearch}>
      <Search size={18} strokeWidth={1.75} aria-hidden="true" />
      <Input ref={inputRef} aria-label="Sayfa ara" placeholder="Ne arıyorsun?" value={query} onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") { event.preventDefault(); resultsRef.current?.querySelector("a")?.focus(); }
          if (event.key === "Enter" && matches.length > 0) { event.preventDefault(); resultsRef.current?.querySelector("a")?.click(); }
        }} />
    </div>
    <p className="sr-only" role="status">{matches.length} sayfa bulundu.</p>
    <ul ref={resultsRef} className={styles.paletteResults} aria-label="Sayfalar" onKeyDown={(event) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const links = Array.from(resultsRef.current?.querySelectorAll("a") ?? []);
      const current = links.indexOf(document.activeElement as HTMLAnchorElement);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      event.preventDefault();
      links[(current + direction + links.length) % links.length]?.focus();
    }}>
      {matches.map(({ href, label, icon: Icon }) => <li key={href}>
        <Link href={href} className={styles.paletteResult} onClick={() => onOpenChange(false)}>
          <Icon size={18} strokeWidth={1.75} aria-hidden="true" /><span>{label}</span><ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </li>)}
    </ul>
    {matches.length === 0 && <p className={styles.noResults}>Eşleşen sayfa bulunamadı. Başka bir ad dene.</p>}
  </Dialog>;
}
