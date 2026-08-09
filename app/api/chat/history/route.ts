import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const history = await prisma.conversation.findMany({
      where: { userId: session.user?.id },
    });
    return NextResponse.json({ chathistroy: history }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Couldn't connect to supabase" },
      { status: 200 },
    );
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: "Convestion Bro",
        updatedAt: new Date(),
      },
    });

    console.log(response);
    return NextResponse.json(
      { message: "Successfully created new Conversation" },
      { status: 200 },
    );
  } catch (error) {}
}
