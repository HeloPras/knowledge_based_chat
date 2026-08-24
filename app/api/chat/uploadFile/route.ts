import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.formData();
  const file = body.get("file");

  if (!file) {
    return NextResponse.json({ error: "no file uploaded" }, { status: 400 });
  }
  try {
    const { data, error } = await supabase.storage
      .from("knowledge_base_file")
      .upload("file_path", file);

    if (error) throw Error(error.message);
    return NextResponse.json({ data: data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Faced Issues while uploading ${error}` },
      { status: 500 },
    );
  }

  // console.log("Its working");
  // return NextResponse.json({ message: "success" }, { status: 200 });
}
