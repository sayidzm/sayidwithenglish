import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isWorkspacePath } from "@/lib/auth/redirect";
import { appOrigin } from "@/lib/auth/origin";
import { supabaseConfig } from "./env";
import type { Database } from "./database.types";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseConfig();
  const supabase = createServerClient<Database>(url, key, {
    cookieOptions: {
      secure: appOrigin().startsWith("https:"),
      sameSite: "lax",
      path: "/",
    },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values, headers) {
        values.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        values.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        Object.entries(headers).forEach(([name, value]) =>
          response.headers.set(name, value),
        );
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  response.headers.set("Cache-Control", "private, no-store");
  if ((!data?.claims || error) && isWorkspacePath(request.nextUrl.pathname)) {
    const target = new URL("/login", request.url);
    if (request.nextUrl.pathname !== "/")
      target.searchParams.set("next", request.nextUrl.pathname);
    const redirected = NextResponse.redirect(target);
    response.cookies
      .getAll()
      .forEach((cookie) => redirected.cookies.set(cookie));
    redirected.headers.set("Cache-Control", "private, no-store");
    for (const name of ["expires", "pragma"]) {
      const value = response.headers.get(name);
      if (value) redirected.headers.set(name, value);
    }
    return redirected;
  }
  return response;
}
