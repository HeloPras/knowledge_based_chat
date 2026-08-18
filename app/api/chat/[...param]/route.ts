import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  UIMessage,
  UIDataTypes,
  UITools,
  convertToModelMessages,
  toUIMessageStream,
  createUIMessageStreamResponse,
  ModelMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma/client";

// interface insideContent {
//   type: "user" | "system" | "assistant" | "tool";
//   text: string;
// }

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

  await prisma.message.create({
    data: {
      role: "user",
      content: message.parts[0].text,
      conversationId: conversationId,
    },
  });

  console.log("Insert Complete");
}

const converToModelMessage = (datas: { role: Roles; content: string }[]) => {
  const transformedData: ModelMessage[] = datas.map((data) => {
    return {
      role: data.role === "user" ? "user" : "assistant",
      content: [{ type: "text", text: data.content }],
    };
  });

  console.log("this is the transformed data", transformedData);
  return transformedData;
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
  let initialData: { role: Roles; content: string }[] = [];
  if (!lastMessage) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  const fetchData = async () => {
    try {
      return await prisma.message.findMany({
        select: {
          role: true,
          content: true,
        },
        where: {
          conversationId: param[0],
        },
      });
    } catch (error) {
      console.error("Couldn't fetch data", error);
      throw error;
    }
  };

  if (initialReq) {
    initialData = await fetchData();
    if (!initialData) {
      return NextResponse.json(
        { message: "No fields were returned" },
        { status: 200 },
      );
    }
  }

  await insertUserMessage(lastMessage, param[0]);

  // console.log(messages[messages.length - 1]?.parts[0]?.text ?? "");

  //
  //
  const displayMessage = await convertToModelMessages(messages);
  // console.log(displayMessage.at(-1).content);

  let assistantText = "";
  let prompt: ModelMessage[];
  const currentPrompt = await convertToModelMessages(messages);

  if (initialReq) {
    const transformedInitalData = converToModelMessage(initialData);
    prompt = [...transformedInitalData, ...currentPrompt];
  } else {
    prompt = currentPrompt;
  }

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: prompt,
      instructions:
        "Only provide with text, don't respond with markdown, points, headlines, bulletpoints, only text",

      onChunk({ chunk }) {
        if (chunk.type === "text-delta") assistantText += chunk.text;
      },
      async onEnd() {
        await prisma.message.create({
          data: {
            role: "assistant",
            content: assistantText,
            conversationId: param[0],
          },
        });
      },
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
