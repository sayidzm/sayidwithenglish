import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./text.module.css";

type TextProps = ComponentProps<"p"> & {
  as?: "p" | "span";
  variant?: "body" | "strong" | "small" | "caption" | "micro" | "expression" | "meaning" | "pronunciation";
};

export function Text({ as: Element = "p", variant = "body", className, ...props }: TextProps) {
  return <Element className={cn(styles[variant], className)} {...props} />;
}
