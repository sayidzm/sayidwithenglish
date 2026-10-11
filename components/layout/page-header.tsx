import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";
import styles from "./shell.module.css";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <div className={styles.pageHeader}>
    <div><h1>{title}</h1>{description && <Text className={styles.pageDescription}>{description}</Text>}</div>
    {actions && <div className={styles.pageActions}>{actions}</div>}
  </div>;
}
