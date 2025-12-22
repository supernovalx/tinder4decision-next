import { NextRequest, NextResponse } from "next/server";

const INVITE_COOKIE_NAME = "decidr_invite_code";

export function middleware(request: NextRequest) {
  const inviteCode = process.env.INVITE_CODE;

  // If no invite code is set in env, allow all requests
  if (!inviteCode) {
    return NextResponse.next();
  }

  // Check if user has valid invite code in cookie
  const storedCode = request.cookies.get(INVITE_COOKIE_NAME)?.value;

  if (storedCode === inviteCode) {
    return NextResponse.next();
  }

  // Allow access to the invite page itself
  if (request.nextUrl.pathname === "/invite") {
    return NextResponse.next();
  }

  // Redirect to invite page
  return NextResponse.redirect(new URL("/invite", request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
