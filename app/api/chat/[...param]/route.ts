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
import { pdfEmbedding } from "@/utils/pdf/pdfEmbedding";
import { supabase } from "@/lib/supabase/client";

// interface insideContent {
//   type: "user" | "system" | "assistant" | "tool";
//   text: string;
// }

// function to insert User Message into Message Table
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

// function to convert user message into the format that is consumed by modal
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

// function to select chunks with similar vector embedding
const extractingSimilarVectors = async (message: string) => {
  try {
    const queryEmbedding = await pdfEmbedding(message);
    if (!queryEmbedding) throw Error("no queryEmbedding returned");

    const vectorString = `[${queryEmbedding.join(",")}]`;

    const data = await prisma.$queryRaw`
  SELECT chunks, 
           1 - (embedding <=> ${vectorString}::vector) AS similarity
    FROM "Chunk"
    WHERE 1 - (embedding <=> ${vectorString}::vector) > 0.50
    ORDER BY similarity DESC
    LIMIT 5;
		`;

    console.log(data);
    if (!data) {
      throw Error("Couldn't return rows from database ");
    }
    return data;
  } catch (error) {
    console.error(error);
  }
};

// get function
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ param: string[] }> },
) {
  const { param } = await params;
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

// Post function
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ param: string[] }> },
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

  // console.log("this is the message", messages);
  // console.log(
  //   "Inside of the messages",
  //   messages[messages.length - 1]?.parts[0]?.text ?? "",
  // );

  //
  //

  let assistantText = "";
  let prompt: ModelMessage[];
  const currentPrompt = await convertToModelMessages(messages);

  if (initialReq) {
    const transformedInitalData = converToModelMessage(initialData);
    prompt = [...transformedInitalData, ...currentPrompt];
  } else {
    prompt = currentPrompt;
  }

  if (!prompt.at(-1)?.content[0].text) throw Error("its not text ");
  const tempStore = prompt.at(-1)?.content[0].text as string;

  console.log("This is the tempStore", tempStore);

  // from here start the embedding of the tempStore and get the similar context
  //

  const data = await extractingSimilarVectors(tempStore);

  prompt.at(-1).content[0].text = `
  context:${data}

  user_message:${tempStore}
  `;

  //

  // console.log("this is the prompt", prompt);
  // console.log("inside the last prompt", prompt.at(-1)?.content);

  try {
    const result = streamText({
      model: google("gemini-2.5-flash"),
      prompt: prompt,
      instructions: `
	You are a knowledge-based assistant. Your job is to answer the user's question using **only the information provided in the knowledge base context**.

	## Rules

	1. **Use only the provided context**

	   * The provided knowledge base context is your only source of information.
	   * Do not use your general knowledge, training data, assumptions, or outside information.
	   * Do not guess, hallucinate, or invent information.
	   * Every factual claim in your answer must be supported by the provided context.

	2. **When the answer is found in the context**

	   * Answer the user's question directly and clearly.
	   * You may summarize, explain, or combine information from different parts of the context.
	   * Make sure the answer remains faithful to the information provided in the context.

	3. **When the answer is NOT found in the context**

	   * Respond with exactly:

	   **Not found in the knowledge base.**

	   * Do not provide an answer using your general knowledge.
	   * Do not guess or speculate about the answer.

	4. **When the context only partially answers the question**

	   * Provide only the information that is supported by the context.
	   * If the missing part is necessary to properly answer the user's question, respond:

	   **Not found in the knowledge base.**

	   * Do not fill in the missing information using outside knowledge.

	5. **When there is no relevant information**

	   * If the provided context does not contain information relevant to the user's question, respond:

	   **Not found in the knowledge base.**

	6. **Conflicting information**

	   * If the context contains conflicting information, do not make up a resolution.
	   * Explain the conflict using only the information present in the context.

	7. **Unclear questions**

	   * If the user's question is unclear, ask a clarification question if the context provides enough information to do so.
	   * Do not assume what the user means.

	## Input

	### Knowledge Base Context

	{{context}}

	### User Question

	{{user_message}}

	## Important

	**Never use information outside of the provided knowledge base context.**

	If the answer cannot be found or reliably determined from the context, respond only with:

	**Not found in the knowledge base.**

	Note: Only answer it in text, no need of any beautifying, any heading or bold or italics, just plain text
	  `,

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
