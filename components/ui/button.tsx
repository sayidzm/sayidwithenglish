import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

type ButtonStyleProps = {
  variant?: "primary" | "secondary" | "ghost" | "destructive";
  size?: "small" | "default" | "large";
};

function buttonClass({ variant = "primary", size = "default" }: ButtonStyleProps, className?: string) {
  return cn(styles.button, styles[variant], styles[size], className);
}

export function Button({ variant, size, className, type = "button", ...props }: ComponentProps<"button"> & ButtonStyleProps) {
  return <button type={type} className={buttonClass({ variant, size }, className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={buttonClass({ variant, size }, className)} {...props} />;
}
