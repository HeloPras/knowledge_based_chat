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
import { prisma } from "@/utils/prisma/client";

async function insertUserPrompt(
  message: UIMessage<unknown, UIDataTypes, UITools>,
) {
  console.log("Initiated prisma client");
  if (!message.parts) {
    return;
  }
  console.log("Parts check");
  if (message?.parts[0].type != "text") {
    return;
  }
  console.log("Text check");
  console.log("Performing Insert");

  await prisma.message.create({
    data: {
      role: "User",
      content: message.parts[0].text,
    },
  });

  console.log("Insert Complete");
}

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const lastMessage = messages.at(-1);
  if (!lastMessage) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }
  await insertUserPrompt(lastMessage);
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
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
