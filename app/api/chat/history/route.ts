import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

const session = await auth();

export async function GET() {
  if (!session) {
    return;
  }

  try {
    const history = await prisma.conversation.findMany({
      where: { userId: session.user?.id },
    });
  } catch (error) {}
  return NextResponse.json({ chathistroy: history }, { status: 200 });
}

export async function POST() {
  if (!session) {
    return;
  }

  try {
    const response = prisma.conversation.create({
      data: {
        userId: session?.user.id,
        title: "Convestion Bro",
      },
    });
  } catch (error) {}
}
