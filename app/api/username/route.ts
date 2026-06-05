import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const RESERVED_USERNAMES = new Set(["setup", "dashboard", "admin", "login", "api", "settings", "hub", "edit"]);

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = (searchParams.get("username") || "").trim().toLowerCase();
  const currentId = (searchParams.get("currentId") || "").trim();

  if (!USERNAME_REGEX.test(username)) return json({ status: "invalid" });
  if (RESERVED_USERNAMES.has(username)) return json({ status: "reserved" });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Username checks are not configured." }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (profileError) return json({ error: profileError.message }, 500);
  if (profile && profile.id !== currentId) return json({ status: "taken" });

  const { data: redirect, error: redirectError } = await supabaseAdmin
    .from("profile_redirects")
    .select("source_username")
    .eq("source_username", username)
    .maybeSingle();

  if (redirectError) return json({ error: redirectError.message }, 500);
  if (redirect) return json({ status: "reserved" });

  return json({ status: "available" });
}
