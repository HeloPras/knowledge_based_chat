import { prisma } from "@/lib/prisma/client";
import next from "next";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) throw Error("no Conversation id provided");
    const exists = await prisma.chunk.findFirst({
      where: {
        conversationId: conversationId,
      },
    });

    if (!exists)
      return NextResponse.json(
        { messge: "Doesn't Exists", exists: false },
        { status: 200 },
      );

    return NextResponse.json(
      { message: "Exists", exists: true },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching atachment" },
      { status: 400 },
    );
  }
}
