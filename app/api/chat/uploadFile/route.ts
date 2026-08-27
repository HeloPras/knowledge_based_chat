import { auth } from "@/lib/auth/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const bucket = supabaseAdmin.storage.from("knowledge_base_file");

  try {
    const user = await auth();

    const body = await req.formData();

    const file = body.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "no file uploaded" }, { status: 400 });
    }

    if (!user?.user?.id) {
      throw Error("User is not authenticated");
    }

    // const listAvailable = await bucket.list(user.user.id);

    // if (listAvailable.error) {
    //   throw Error(listAvailable.error.message);
    // }
    //
    // if (!listAvailable.data) {
    //   const { error } = await bucket.list(user.user.id);
    //   if (error) {
    //     throw Error(error.message);
    //   }
    // }
    //

    const uploadedData = await bucket.upload(
      `${user.user.id}/${file.name}`,
      file,
    );

    if (uploadedData.error) {
      throw Error(uploadedData.error.message);
    }

    console.log(uploadedData);

    return NextResponse.json({ data: uploadedData.data }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: `Faced Issues while uploading ${error}` },
      { status: 500 },
    );
  }

  // console.log("Its working");
  // return NextResponse.json({ message: "success" }, { status: 200 });
}
