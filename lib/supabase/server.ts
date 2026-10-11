import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { appOrigin } from "@/lib/auth/origin";
import { supabaseConfig } from "./env";
import type { Database } from "./database.types";

export async function createClient() {
  // Supabase's session initialization reads the clock. With Cache Components,
  // establish request-time execution before constructing the third-party SDK.
  await connection();
  const store = await cookies();
  const { url, key } = supabaseConfig();
  return createServerClient<Database>(url, key, {
    cookieOptions: {
      secure: appOrigin().startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) =>
            store.set(name, value, options),
          );
        } catch {
          // Server Components cannot write cookies. Proxy refreshes the session
          // before rendering; Actions and Route Handlers can write normally.
        }
      },
    },
  });
}
