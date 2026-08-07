import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // const publicRoute = ["/login"];
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (req.nextUrl.pathname == "/login" && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/"],
};
