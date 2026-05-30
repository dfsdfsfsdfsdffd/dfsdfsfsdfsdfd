import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const USERNAME_REGEX = /^[a-z0-9_-]{3,30}$/;
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

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { error: "Signup is not configured." },
      { status: 500 }
    );
  }

  let body: { email?: string; password?: string; username?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid signup request." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  const username = body.username?.trim().toLowerCase().replace(/\s+/g, "") ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json(
      { error: "Username must be 3-30 characters and may only include letters, numbers, underscores, or hyphens." },
      { status: 400 }
    );
  }

  if (RESERVED_USERNAMES.has(username)) {
    return NextResponse.json({ error: "That username is reserved." }, { status: 409 });
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
    return NextResponse.json(
      { error: "Unable to verify username availability." },
      { status: 500 }
    );
  }

  if (existingProfile) {
    return NextResponse.json({ error: "That username is already taken." }, { status: 409 });
  }

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: username },
  });

  if (createUserError || !createdUser.user?.id) {
    return NextResponse.json(
      { error: createUserError?.message ?? "Unable to create account." },
      { status: 400 }
    );
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
    return NextResponse.json(
      { error: profileError.message || "Profile setup failed." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
