import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(styles.input, className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(styles.input, styles.textarea, className)} {...props} />;
}
export function Checkbox({ className, ...props }: Omit<ComponentProps<"input">, "type">) {
  return <input type="checkbox" className={cn(styles.checkbox, className)} {...props} />;
}
