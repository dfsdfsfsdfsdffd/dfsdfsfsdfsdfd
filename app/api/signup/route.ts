export const runtime = "edge";

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_IP_ATTEMPTS = 8;
const MAX_EMAIL_ATTEMPTS = 3;
const RESERVED_USERNAMES = new Set([
  "setup",
  "dashboard",
  "admin",
  "login",
  "api",
  "settings",
  "hub",
  "edit",
]);

const attempts = new Map<string, { count: number; resetAt: number }>();

function json(data: { error?: string; ok?: boolean }, status = 200) {
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

function hitLimit(key: string, max: number) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > max;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json({ error: "Signup is not configured." }, 500);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) {
    return json({ error: "Signup request is too large." }, 413);
  }

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");

  try {
    if (origin && host && new URL(origin).host !== host) {
      return json({ error: "Invalid signup request." }, 403);
    }
  } catch {
    return json({ error: "Invalid signup request." }, 403);
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Invalid signup request." }, 415);
  }

  let body: { email?: string; password?: string; username?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid signup request." }, 400);
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const username = body.username?.trim().toLowerCase().replace(/\s+/g, "") ?? "";

  if (!email || !password) {
    return json({ error: "Email and password are required." }, 400);
  }

  if (!EMAIL_REGEX.test(email)) {
    return json({ error: "Enter a valid email address." }, 400);
  }

  const ip = getClientIp(request);
  if (hitLimit(`ip:${ip}`, MAX_IP_ATTEMPTS) || hitLimit(`email:${email}`, MAX_EMAIL_ATTEMPTS)) {
    return json({ error: "Too many signup attempts. Try again in a few minutes." }, 429);
  }

  if (password.length < 6) {
    return json({ error: "Password must be at least 6 characters." }, 400);
  }

  if (!USERNAME_REGEX.test(username)) {
    return json(
      { error: "Username must be 3-30 characters and may only include letters, numbers, underscores, or hyphens." },
      400
    );
  }

  if (RESERVED_USERNAMES.has(username)) {
    return json({ error: "That username is reserved." }, 409);
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (existingProfileError) {
    return json({ error: "Unable to verify username availability." }, 500);
  }

  if (existingProfile) {
    return json({ error: "That username is already taken." }, 409);
  }

  const { data: existingRedirect, error: existingRedirectError } = await supabaseAdmin
    .from("profile_redirects")
    .select("source_username")
    .eq("source_username", username)
    .maybeSingle();

  if (existingRedirectError && !isMissingRedirectsTable(existingRedirectError)) {
    return json({ error: "Unable to verify username availability." }, 500);
  }

  if (existingRedirect) {
    return json({ error: "That username is reserved." }, 409);
  }

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: username },
  });

  if (createUserError || !createdUser.user?.id) {
    return json({ error: createUserError?.message ?? "Unable to create account." }, 400);
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      {
        id: createdUser.user.id,
        username,
        email,
        views: 0,
        setup_completed: true,
      },
      { onConflict: "id" }
    );

  if (profileError) {
    await supabaseAdmin.auth.admin.deleteUser(createdUser.user.id);
    return json({ error: profileError.message || "Profile setup failed." }, 500);
  }

  return json({ ok: true });
}
