import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

type BadgePayload = {
  id?: string;
  badges?: {
    user?: boolean;
    dev?: boolean;
    staff?: boolean;
  };
};

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

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return json({ error: "Unauthorized." }, 401);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Invalid request." }, 415);
  }

  let body: BadgePayload;

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  if (!body.id || !body.badges) {
    return json({ error: "Missing user or badges." }, 400);
  }

  const badges = {
    user: Boolean(body.badges.user),
    dev: Boolean(body.badges.dev),
    staff: Boolean(body.badges.staff),
  };

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
    .update({ badges })
    .eq("id", body.id)
    .select("id, username, email, display_name, avatar_url, views, badges")
    .single();

  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ user: data });
}
