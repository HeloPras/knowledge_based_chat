import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  UIMessage,
  UIDataTypes,
  UITools,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { google } from "@ai-sdk/google";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

async function insertUserPrompt(
  message: UIMessage<unknown, UIDataTypes, UITools>,
) {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

  const prisma = new PrismaClient({ adapter });
  if (!message.parts) {
    return;
  }
  if (message?.parts[0].type != "text") {
    return;
  }
  prisma.message.create({
    data: {
      role: "User",
      content: message.parts[0].text,
    },
  });
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  insertUserPrompt(messages[messages.length - 1]);
  // console.log(messages[messages.length - 1]?.parts[0]?.text ?? "");

  //
  // console.log(await convertToModelMessages(messages));
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: await convertToModelMessages(messages),
      instructions:
        "Only provide with text, don't respond with markdown, points, headlines, bulletpoints, only text",
    });
    const message = createUIMessageStreamResponse({
      stream: toUIMessageStream({ stream: result.stream }),
    });
    // const something = await message.text();
    // console.log(something);
    return message;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed" }, { status: 400 });
  }
}
