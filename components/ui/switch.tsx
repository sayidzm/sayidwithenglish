"use client";

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

type SwitchProps = Omit<ComponentProps<"button">, "onChange" | "role" | "aria-checked" | "children" | "type"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function Switch({ checked, onCheckedChange, className, onClick, ...props }: SwitchProps) {
  return (
    <button {...props} type="button" role="switch" aria-checked={checked}
      className={cn(styles.switch, className)} onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) onCheckedChange(!checked);
      }}>
      <span className={styles.switchThumb} />
    </button>
  );
}
