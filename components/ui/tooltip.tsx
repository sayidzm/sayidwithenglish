"use client";

import * as Primitive from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";
import styles from "./ui.module.css";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <Primitive.Provider delayDuration={350}>{children}</Primitive.Provider>;
}

export function Tooltip({ children, label, side = "bottom" }: { children: ReactElement; label: string; side?: "top" | "right" | "bottom" | "left" }) {
  return <Primitive.Root><Primitive.Trigger asChild>{children}</Primitive.Trigger>
    <Primitive.Portal><Primitive.Content className={styles.tooltip} side={side} sideOffset={8}>
      {label}<Primitive.Arrow className={styles.tooltipArrow} />
    </Primitive.Content></Primitive.Portal>
  </Primitive.Root>;
}
