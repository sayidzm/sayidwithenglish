import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

type BadgeProps = ComponentProps<"span"> & { tone?: "neutral" | "blue" | "violet" | "success" | "warning" | "danger" };

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return <span className={cn(styles.badge, styles[`badge_${tone}`], className)} {...props} />;
}
