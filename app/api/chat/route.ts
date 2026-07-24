import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
} from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: NextRequest) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  // console.log(messages);
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
    console.log(message);
    return message;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed" }, { status: 400 });
  }
}
