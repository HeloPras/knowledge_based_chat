import { auth } from "@/lib/auth/auth";
import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const user = await auth();

  console.log(user?.user?.id);

  const body = await req.formData();
  const file = body.get("file");

  if (!file) {
    return NextResponse.json({ error: "no file uploaded" }, { status: 400 });
  }

  try {
    if (!user?.user?.id) {
      throw Error("User is not authenticated");
    }

    const bucketAvailable = await supabase.storage.getBucket(user.user.id);

    if (bucketAvailable.error) {
      throw Error(bucketAvailable.error.message);
    }

    if (!bucketAvailable.data) {
      const { error } = await supabase.storage.createBucket(user.user.id);
      if (error) {
        throw Error(error.message);
      }
    }

    const uploadedData = await supabase.storage
      .from("knowledge_base_file")
      .upload(user.user.id, file);

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
