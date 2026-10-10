import { NextRequest, NextResponse } from "next/server";
import {
  streamText,
  UIMessage,
  convertToModelMessages,
  ModelMessage,
} from "ai";
import { google } from "@ai-sdk/google";
import { prisma } from "@/lib/prisma/client";
import { pdfEmbedding } from "@/utils/pdf/pdfEmbedding";

type Role = string; // replace with your Prisma Role enum if you have one

const SYSTEM_PROMPT = `
You are a knowledge-based assistant. Answer the user's question using ONLY the knowledge base context given in the user's message.

Rules:
1. Use only the provided context. Do not use general knowledge, assumptions, or outside information. Do not guess or invent anything.
2. If the answer is in the context, answer directly and clearly. You may summarize or combine parts of the context.
3. If the answer is not in the context, or the context only partially answers it and the missing part is necessary, respond exactly with: Not found in the knowledge base.
4. If the context contains conflicting information, explain the conflict using only the context. Do not resolve it yourself.
5. If the question is unclear, ask a clarifying question only if the context gives enough information to do so.

Answer in plain text only: no headings, bold, italics, or other formatting.
`;

async function insertUserMessage(text: string, conversationId: string) {
  await prisma.message.create({
    data: { role: "user", content: text, conversationId },
  });
}

// convert DB rows into model messages
const toModelMessages = (
  rows: { role: Role; content: string }[],
): ModelMessage[] =>
  rows.map((r) => ({
    role: r.role === "user" ? "user" : "assistant",
    content: r.content,
  }));

// select chunks with similar vector embedding
const extractingSimilarVectors = async (message: string): Promise<string[]> => {
  try {
    const queryEmbedding = await pdfEmbedding(message);
    if (!queryEmbedding) throw new Error("no queryEmbedding returned");

    const vectorString = `[${queryEmbedding.join(",")}]`;

    const rows = await prisma.$queryRaw<
      { chunks: string; similarity: number }[]
    >`
      SELECT chunks,
             1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM "Chunk"
      WHERE 1 - (embedding <=> ${vectorString}::vector) > 0.50
      ORDER BY similarity DESC
      LIMIT 5;
    `;

    return rows.map((r) => r.chunks);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ param: string[] }> },
) {
  const { param } = await params;
  try {
    const messages = await prisma.message.findMany({
      where: { conversationId: param[0] },
    });
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ param: string[] }> },
) {
  const { param } = await params;
  const conversationId = param[0];

  const {
    messages,
    initialReq,
  }: { messages: UIMessage[]; initialReq: boolean } = await req.json();

  const lastMessage = messages.at(-1);
  if (!lastMessage) {
    return NextResponse.json({ error: "No message provided" }, { status: 400 });
  }

  // read the user's text from the UI message parts (this fixes the type error)
  const userText = (lastMessage.parts ?? [])
    .map((p) => (p.type === "text" ? p.text : ""))
    .join("")
    .trim();

  if (!userText) {
    return NextResponse.json(
      { error: "Last message has no text" },
      { status: 400 },
    );
  }

  try {
    // load previous history from DB only on the first request
    let history: ModelMessage[] = [];
    if (initialReq) {
      const rows = await prisma.message.findMany({
        select: { role: true, content: true },
        where: { conversationId },
      });
      history = toModelMessages(rows);
    }

    // save the user's message
    await insertUserMessage(userText, conversationId);

    // everything except the last message (we rebuild the last one with context)
    const currentPrompt = await convertToModelMessages(messages);
    const previous = currentPrompt.slice(0, -1);

    // RAG: fetch similar chunks and put them in the final user message
    const chunks = await extractingSimilarVectors(userText);
    const context = chunks.length
      ? chunks.join("\n\n")
      : "(no relevant context found)";

    const finalMessages: ModelMessage[] = [
      ...history,
      ...previous,
      {
        role: "user",
        content: `context:\n${context}\n\nuser_message:\n${userText}`,
      },
    ];

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: finalMessages,
      async onFinish({ text }) {
        try {
          await prisma.message.create({
            data: { role: "assistant", content: text, conversationId },
          });
        } catch (error) {
          console.error("Failed to save assistant message", error);
        }
      },
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed" }, { status: 500 });
  }
}
