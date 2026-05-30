import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "123";
}

function isAuthorized(request: Request) {
  return request.headers.get("x-admin-password") === adminPassword();
}

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
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized." }, 401);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Admin is not configured." }, 500);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, username, email, display_name, avatar_url, views, badges")
    .order("username", { ascending: true });

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ users: data || [] });
}
