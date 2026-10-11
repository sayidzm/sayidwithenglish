"use client";

import * as Primitive from "@radix-ui/react-dropdown-menu";
import type { ComponentProps, ReactElement, ReactNode } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

export function Dropdown({ trigger, children, label }: { trigger: ReactElement; children: ReactNode; label: string }) {
  return <Primitive.Root><Primitive.Trigger asChild>{trigger}</Primitive.Trigger>
    <Primitive.Portal><Primitive.Content aria-label={label} className={styles.dropdown} align="end" sideOffset={8} collisionPadding={16}>{children}</Primitive.Content></Primitive.Portal>
  </Primitive.Root>;
}
export function DropdownItem({ className, ...props }: ComponentProps<typeof Primitive.Item>) {
  return <Primitive.Item className={cn(styles.dropdownItem, className)} {...props} />;
}
export function DropdownLabel({ children }: { children: ReactNode }) {
  return <Primitive.Label className={styles.dropdownLabel}>{children}</Primitive.Label>;
}
export function DropdownSeparator() { return <Primitive.Separator className={styles.dropdownSeparator} />; }
export function DropdownMessage({ children }: { children: ReactNode }) { return <p className={styles.dropdownMessage}>{children}</p>; }
