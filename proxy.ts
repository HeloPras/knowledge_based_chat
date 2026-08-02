export { auth as proxy } from "@/lib/auth/auth";

import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth();

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  } else {
    return NextResponse.redirect(new URL("/", req.url));
  }
}
