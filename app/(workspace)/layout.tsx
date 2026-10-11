import { AppShell } from "@/components/layout/app-shell";
import { PrototypeProvider } from "@/components/workspace/prototype-provider";

export default function WorkspaceLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <PrototypeProvider><AppShell>{children}</AppShell></PrototypeProvider>;
}
