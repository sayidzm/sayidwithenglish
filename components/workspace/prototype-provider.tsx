"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import {
  initialSettings,
  mockEntries,
  type Entry,
  type WorkspaceSettings,
} from "@/lib/mock-data";

type PrototypeState = {
  entries: Entry[];
  addEntries: (entries: Entry[]) => void;
  updateEntry: (entry: Entry) => void;
  settings: WorkspaceSettings;
  saveSettings: (settings: WorkspaceSettings) => void;
  reviewed: number;
  setReviewed: (count: number) => void;
  focusMode: boolean;
  setFocusMode: (focus: boolean) => void;
};
const PrototypeContext = createContext<PrototypeState | null>(null);

/** In-memory prototype state. A full reload restores the curated examples. */
export function PrototypeProvider({
  children,
  initialPreferences = initialSettings,
}: {
  children: ReactNode;
  initialPreferences?: WorkspaceSettings;
}) {
  const [entries, setEntries] = useState(mockEntries);
  const [settings, saveSettings] = useState(initialPreferences);
  const [reviewed, setReviewed] = useState(12);
  const [focusMode, setFocusMode] = useState(false);
  const addEntries = (added: Entry[]) =>
    setEntries((current) => [...added, ...current]);
  const updateEntry = (entry: Entry) =>
    setEntries((current) =>
      current.map((item) => (item.id === entry.id ? entry : item)),
    );
  return (
    <PrototypeContext.Provider
      value={{
        entries,
        addEntries,
        updateEntry,
        settings,
        saveSettings,
        reviewed,
        setReviewed,
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
