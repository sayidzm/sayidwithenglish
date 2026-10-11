"use client";

import * as Primitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode, RefObject } from "react";
import { Button } from "./button";
import styles from "./ui.module.css";

export function Dialog({ open, onOpenChange, title, description, children, returnFocusRef, initialFocusRef }: {
  open: boolean; onOpenChange: (open: boolean) => void; title: string; description: string;
  children: ReactNode; returnFocusRef?: RefObject<HTMLElement | null>; initialFocusRef?: RefObject<HTMLElement | null>;
}) {
  return <Primitive.Root open={open} onOpenChange={onOpenChange}>
    <Primitive.Portal><Primitive.Overlay className={styles.overlay} />
      <Primitive.Content className={styles.dialog} onOpenAutoFocus={(event) => {
        if (initialFocusRef?.current) { event.preventDefault(); initialFocusRef.current.focus(); }
      }} onCloseAutoFocus={(event) => {
        if (returnFocusRef?.current) { event.preventDefault(); returnFocusRef.current.focus(); }
      }}>
        <div className={styles.dialogHeader}>
          <Primitive.Title className={styles.dialogTitle}>{title}</Primitive.Title>
          <Primitive.Close asChild><Button variant="ghost" size="small" className={styles.dialogClose} aria-label="Kapat" title="Kapat"><X aria-hidden="true" /></Button></Primitive.Close>
        </div>
        <Primitive.Description className={styles.dialogDescription}>{description}</Primitive.Description>
        {children}
      </Primitive.Content>
    </Primitive.Portal>
  </Primitive.Root>;
}
