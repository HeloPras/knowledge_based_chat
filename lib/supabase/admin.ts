import { cookies } from "next/headers";
import { createClient } from "./server";

const cookie = await cookies();

export const supabaseAdmin = createClient(cookie);
