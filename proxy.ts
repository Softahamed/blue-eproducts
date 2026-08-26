import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function passwordToken(password: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function proxy(request: NextRequest) {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const session = request.cookies.get("admin_session")?.value;
  const valid = expectedPassword && session === await passwordToken(expectedPassword);

  if (!valid) return NextResponse.redirect(new URL("/admin/login", request.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/dashboard/:path*"] };