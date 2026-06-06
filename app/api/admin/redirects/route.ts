import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 60;
const attempts = new Map<string, { count: number; resetAt: number }>();

function adminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  return process.env.NODE_ENV === "production" ? "" : "123";
}

function isAuthorized(request: Request) {
  const password = adminPassword();
  const cookie = request.headers
    .get("cookie")
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("softcard_admin="))
    ?.split("=")[1];
  return Boolean(password) && decodeURIComponent(cookie || "") === password;
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") || "unknown";
}

function hitLimit(key: string) {
  const now = Date.now();
  const existing = attempts.get(key);

  if (!existing || existing.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  existing.count += 1;
  return existing.count > MAX_ATTEMPTS;
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return true;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
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

function isMissingRedirectsTable(error: { code?: string; message?: string } | null) {
  return Boolean(
    error &&
      (error.code === "42P01" ||
        error.code === "PGRST205" ||
        error.message?.toLowerCase().includes("profile_redirects"))
  );
}

function adminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function GET(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request." }, 403);
  if (hitLimit(`admin-redirects:${getClientIp(request)}`)) return json({ error: "Too many admin requests." }, 429);
  if (!isAuthorized(request)) return json({ error: "Unauthorized." }, 401);

  const supabaseAdmin = adminClient();
  if (!supabaseAdmin) return json({ error: "Admin is not configured." }, 500);

  const { data, error } = await supabaseAdmin
    .from("profile_redirects")
    .select("id, source_username, target_username, target_user_id, created_at")
    .order("source_username", { ascending: true });

  if (error) {
    if (isMissingRedirectsTable(error)) return json({ redirects: [], missingTable: true });
    return json({ error: error.message }, 500);
  }

  return json({ redirects: data || [] });
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return json({ error: "Invalid request." }, 403);
  if (hitLimit(`admin-redirects:${getClientIp(request)}`)) return json({ error: "Too many admin requests." }, 429);
  if (!isAuthorized(request)) return json({ error: "Unauthorized." }, 401);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 4096) return json({ error: "Request is too large." }, 413);
  if (!request.headers.get("content-type")?.includes("application/json")) return json({ error: "Invalid request." }, 415);

  let body: { action?: string; source?: string; target?: string };

  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const source = (body.source || "").trim().toLowerCase();
  const target = (body.target || "").trim().toLowerCase();

  if (!USERNAME_REGEX.test(source)) return json({ error: "Source username is invalid." }, 400);

  const supabaseAdmin = adminClient();
  if (!supabaseAdmin) return json({ error: "Admin is not configured." }, 500);

  if (body.action === "delete") {
    const { error } = await supabaseAdmin.from("profile_redirects").delete().eq("source_username", source);
    if (error && isMissingRedirectsTable(error)) return json({ error: "Redirects table is not installed. Run supabase-profile-redirects.sql first." }, 503);
    if (error) return json({ error: error.message }, 500);
    return GET(request);
  }

  if (!USERNAME_REGEX.test(target)) return json({ error: "Target username is invalid." }, 400);
  if (source === target) return json({ error: "Source cannot redirect to itself." }, 400);

  const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("username", source)
    .maybeSingle();

  if (existingProfileError) return json({ error: existingProfileError.message }, 500);
  if (existingProfile) return json({ error: "Source username is already an active profile." }, 409);

  const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
    .from("profiles")
    .select("id, username")
    .eq("username", target)
    .maybeSingle();

  if (targetProfileError) return json({ error: targetProfileError.message }, 500);
  if (!targetProfile) return json({ error: "Target profile does not exist." }, 404);

  const { error } = await supabaseAdmin
    .from("profile_redirects")
    .upsert(
      {
        source_username: source,
        target_username: targetProfile.username,
        target_user_id: targetProfile.id,
      },
      { onConflict: "source_username" }
    );

  if (error) {
    if (isMissingRedirectsTable(error)) return json({ error: "Redirects table is not installed. Run supabase-profile-redirects.sql first." }, 503);
    return json({ error: error.message }, 500);
  }

  return GET(request);
}
