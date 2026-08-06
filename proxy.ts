import { auth } from "@/lib/auth/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  // const publicRoute = ["/login"];
  // const session = await auth();

  console.log("We are in the middle ware");

  if (req.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", req.url));
  } else {
    return NextResponse.next();
  }
}

// export const config = {
//   matcher: ["/login", "/"],
// };
