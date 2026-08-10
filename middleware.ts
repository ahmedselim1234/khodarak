import { NextResponse, type NextRequest } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

// Enforces the matrix in specs/002-phase-1-auth-address/contracts/route-protection.md.
// This is a UX-layer gate only — Row Level Security (Constitution Principle V)
// remains the actual authorization boundary underneath every query a page
// makes, so a bug here fails safe into a redirect, never into exposing data.
const CUSTOMER_OR_ADMIN_PREFIXES = ["/subscription", "/dashboard"];
const ADMIN_ONLY_PREFIXES = ["/admin"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareClient(request);
  const pathname = request.nextUrl.pathname;

  const needsAuth =
    matchesPrefix(pathname, CUSTOMER_OR_ADMIN_PREFIXES) ||
    matchesPrefix(pathname, ADMIN_ONLY_PREFIXES);

  if (!needsAuth) {
    return response;
  }

  // Validates the session against Supabase (not just a decoded-but-unverified
  // cookie) — getUser(), not getSession().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (matchesPrefix(pathname, ADMIN_ONLY_PREFIXES)) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    // A missing profiles row shouldn't happen given the creation trigger,
    // but defensively treat it as customer — denied from /admin.
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/subscription/:path*", "/dashboard/:path*", "/admin/:path*"],
};
