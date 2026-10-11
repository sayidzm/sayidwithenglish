"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  initialSettings,
  type WorkspaceSettings,
} from "@/lib/mock-data";

type PrototypeState = {
  settings: WorkspaceSettings;
  saveSettings: (settings: WorkspaceSettings) => void;
  focusMode: boolean;
  setFocusMode: (value: boolean) => void;
};
const PrototypeContext = createContext<PrototypeState | null>(null);

/** Session preferences for controls; vocabulary and learning data live in Supabase. */
export function PrototypeProvider({
  children,
  initialPreferences = initialSettings,
}: {
  children: ReactNode;
  initialPreferences?: WorkspaceSettings;
}) {
  const [settings, saveSettings] = useState(initialPreferences);
  const [focusMode, setFocusMode] = useState(false);
  return (
    <PrototypeContext.Provider
      value={{
        settings,
        saveSettings,
        focusMode,
        setFocusMode,
      }}
    >
      {children}
    </PrototypeContext.Provider>
  );
}
export function usePrototype() {
  const value = useContext(PrototypeContext);
  if (!value)
    throw new Error("usePrototype must be used within PrototypeProvider");
  return value;
}
