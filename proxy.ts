import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export function proxy(request: NextRequest) {
  return updateSession(request);
}
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/add/:path*",
    "/library/:path*",
    "/learn/:path*",
    "/review/:path*",
    "/tutor/:path*",
    "/statistics/:path*",
    "/settings/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/auth/:path*",
  ],
};
