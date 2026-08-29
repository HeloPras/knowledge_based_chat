import { auth } from "@/lib/auth/auth";
import { supabase } from "@/lib/supabase/client";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function POST(req: NextRequest) {
  // const bucket = supabaseAdmin.storage.from("knowledge_base_file");
  const bucket = supabaseAdmin.storage.from("knowledge_base_file");

  try {
    const user = await auth();

    const body = await req.formData();

    const file = body.get("file");
    const conversationId = body.get("conversationId") as string;

    if (!conversationId) {
      throw Error("No Conversation Id provided");
    }
    const exists = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
      },
    });

    if (!exists) {
      throw Error("Conversation Doesn't Exists");
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "no file uploaded" }, { status: 400 });
    }

    if (!user?.user?.id) {
      throw Error("User is not authenticated");
    }

    const uploadedData = await bucket.upload(
      `${user.user.id}/${conversationId}/${file.name}`,
      file,
    );

    if (uploadedData.error) {
      throw Error(`uploadedData Error: ${uploadedData.error.message}`);
    }

    return NextResponse.json(
      { message: "Successfully Uploaded" },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: ` ${error}` }, { status: 500 });
  }

  // console.log("Its working");
  // return NextResponse.json({ message: "success" }, { status: 200 });
}
