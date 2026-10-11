import { navigation } from "@/lib/navigation";

/** Return URLs are restricted to real workspace routes, not arbitrary origins. */
export function safeNext(value: unknown): string {
  return typeof value === "string" &&
    navigation.some(({ href }) => href === value)
    ? value
    : "/dashboard";
}
export function isWorkspacePath(path: string) {
  return (
    path === "/" ||
    navigation.some(({ href }) => path === href || path.startsWith(`${href}/`))
  );
}
