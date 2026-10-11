"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabaseConfig } from "./env";
import type { Database } from "./database.types";

export function createClient() {
  const { url, key } = supabaseConfig();
  return createBrowserClient<Database>(url, key, {
    cookieOptions: {
      secure:
        typeof window !== "undefined" && window.location.protocol === "https:",
      sameSite: "lax",
      path: "/",
    },
  });
}
