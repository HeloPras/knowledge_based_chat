import { NextRequest, NextResponse } from "next/server";
import { pdfEmbedding } from "@/utils/pdf/pdfEmbedding";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  const { conversationId, texts } = await req.json();

  try {
    for (const t of texts.text) {
      const embedding = await pdfEmbedding(t);

      if (!embedding) throw Error("No embedding");

      const vector = `[${embedding.join(",")}]`;
      const response = await prisma.$executeRaw`
  INSERT INTO "Chunk"
  	("conversationId","chunks","embedding")
  Values (
  	${conversationId},${t},${vector}::vector
  ) `;

      console.log(response);
    }

    return NextResponse.json({ message: "Success" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Couldn't upload", error },
      { status: 200 },
    );
  }
}
