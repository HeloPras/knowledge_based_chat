import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SERVICE_ROLE_KEY || "";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const supabaseAdmin = createClient(url, serviceRoleKey);
