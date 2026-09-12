import { NextResponse, type NextRequest } from "next/server"

import { verifySessionToken } from "@/agent/lib/session"

export const config = {
  matcher: ["/", "/s", "/s/:path*"],
}

export async function proxy(request: NextRequest) {
  const session = await verifySessionToken(request.headers.get("cookie"))
  if (session) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL("/login", request.url))
}
