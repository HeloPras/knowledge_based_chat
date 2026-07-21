import { NextRequest, NextResponse } from "next/server";

export function POST(req: NextRequest) {
  try {
  } catch (error) {
    return NextResponse.json({ message: "Failed" }, { status: 400 });
  }

  return NextResponse.json({ message: "response" }, { status: 200 });
}
