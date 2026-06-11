export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function isMissingRedirectsTable(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.toLowerCase().includes("profile_redirects"))
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") || "").trim().toLowerCase();

  if (!USERNAME_REGEX.test(username)) return json({ target: null });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return json({ target: null });

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabaseAdmin
    .from("profile_redirects")
    .select("target_username")
    .eq("source_username", username)
    .maybeSingle();

  if (error && !isMissingRedirectsTable(error)) {
    return json({ target: null });
  }

  if (!data?.target_username || data.target_username === username) {
    return json({ target: null });
  }

  return json({ target: data.target_username });
}
