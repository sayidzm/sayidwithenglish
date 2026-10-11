import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import styles from "./ui.module.css";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.card, className)} {...props} />;
}
export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.cardHeader, className)} {...props} />;
}
export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(styles.cardContent, className)} {...props} />;
}
