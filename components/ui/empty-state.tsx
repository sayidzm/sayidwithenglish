import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Text } from "./text";
import styles from "./empty-state.module.css";

export function EmptyState({ icon: Icon, title, description, action }: {
  icon: LucideIcon; title: string; description: string; action?: ReactNode;
}) {
  return <div className={styles.emptyState}>
    <Icon className={styles.icon} size={32} strokeWidth={1.75} aria-hidden="true" />
    <h2>{title}</h2><Text>{description}</Text>
    {action && <div className={styles.action}>{action}</div>}
  </div>;
}
