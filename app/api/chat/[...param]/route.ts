import { NextRequest, NextResponse } from "next/server";

export async function GET() {}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  const { param } = await params;

  const body = await req.json();

  return NextResponse.json({ message: "Success" }, { status: 200 });
}
