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
import { prisma } from "@/lib/prisma/client";

interface insideContent {
  type: "text";
  text: string;
}

async function insertUserMessage(
  message: UIMessage<unknown, UIDataTypes, UITools>,
  conversationId: string,
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

  // await prisma.message.create({
  //   data: {
  //     role: "user",
  //     content: message.parts[0].text,
  //     conversationId: conversationId,
  //   },
  // });

  console.log("Insert Complete");
}

const converToUIMessage = (datas: { role: string; content: string }[]) => {
  const transformedData: { role: string; content: insideContent[][] }[] =
    datas.map((data) => {
      return {
        role: data.role,
        content: [[{ type: "text", text: data.content }]],
      };
    });

  console.log(transformedData);
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  const { param } = await params;
  // console.log(param);
  try {
    const messages = await prisma.message.findMany({
      where: {
        conversationId: param[0],
      },
    });

    return NextResponse.json({ messages: messages }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch " }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ param: string }> },
) {
  const { param } = await params;
  const {
    messages,
    initialReq,
  }: { messages: UIMessage[]; initialReq: boolean } = await req.json();
  const lastMessage = messages.at(-1);
  if (!lastMessage) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  await insertUserMessage(lastMessage, param[0]);

  // console.log(messages[messages.length - 1]?.parts[0]?.text ?? "");

  //
  //
  console.log("this is UIMessage: ", messages);
  const displayMessage = await convertToModelMessages(messages);
  console.log(displayMessage);
  console.log(displayMessage.at(-1).content);

  let assistantText = "";
  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: await convertToModelMessages(messages),
      instructions:
        "Only provide with text, don't respond with markdown, points, headlines, bulletpoints, only text",

      onChunk({ chunk }) {
        if (chunk.type === "text-delta") assistantText += chunk.text;
      },
      // async onEnd() {
      //   await prisma.message.create({
      //     data: {
      //       role: "AI",
      //       content: assistantText,
      //       conversationId: param[0],
      //     },
      //   });
      // },
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
