import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

const META_TYPE = "__softcard_meta";

function discordRedirectUri(request: NextRequest) {
  if (process.env.DISCORD_REDIRECT_URI) return process.env.DISCORD_REDIRECT_URI;
  if (process.env.NEXT_PUBLIC_SITE_URL) return new URL("/api/discord/callback", process.env.NEXT_PUBLIC_SITE_URL).toString();
  return new URL("/api/discord/callback", request.url).toString();
}

function avatarUrl(user: any) {
  if (user?.avatar && user?.id) {
    const ext = String(user.avatar).startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
  }

  const discriminator = Number(user?.discriminator || 0);
  const fallbackIndex = discriminator > 0 ? discriminator % 5 : Number(BigInt(user?.id || 0) >> BigInt(22)) % 6;
  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

function displayName(user: any) {
  return String(user?.global_name || user?.username || "Discord").slice(0, 40);
}

function writeMeta(items: any[], patch: Record<string, unknown>) {
  const existing = items.filter((link) => link?.type !== META_TYPE);
  const current = items.find((link) => link?.type === META_TYPE);

  return [
    ...existing,
    {
      id: -1,
      type: META_TYPE,
      url: "https://softcard.cc",
      label: "",
      enabled: false,
      featured: false,
      ...(current || {}),
      meta: {
        ...(current?.meta || {}),
        ...patch,
      },
    },
  ];
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const savedState = request.cookies.get("softcard_discord_state")?.value;

  if (!code || !state || !savedState || state !== savedState) {
    return NextResponse.redirect(new URL("/dashboard?discord=invalid", request.url));
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;

  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey || !clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/dashboard?discord=not-configured", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard?discord=connected", request.url));
  response.cookies.set("softcard_discord_state", "", { maxAge: 0, path: "/" });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: any) {
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: discordRedirectUri(request),
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL("/dashboard?discord=token-failed", request.url));
  }

  const token = await tokenResponse.json();
  const userResponse = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });

  if (!userResponse.ok) {
    return NextResponse.redirect(new URL("/dashboard?discord=user-failed", request.url));
  }

  const discordUser = await userResponse.json();
  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("links")
    .eq("id", user.id)
    .single();

  const links = Array.isArray(profile?.links) ? profile.links : [];
  const { error: saveError } = await supabaseAdmin
    .from("profiles")
    .update({
      links: writeMeta(links, {
        discordId: String(discordUser.id || ""),
        discordName: displayName(discordUser),
        discordUsername: String(discordUser.username || ""),
        discordAvatar: avatarUrl(discordUser),
        discordUrl: discordUser.id ? `https://discord.com/users/${discordUser.id}` : "",
        discordConnected: true,
        discordConnectedAt: new Date().toISOString(),
        discordStatus: "connected discord",
      }),
    })
    .eq("id", user.id);

  if (saveError) {
    return NextResponse.redirect(new URL("/dashboard?discord=save-failed", request.url));
  }

  return response;
}
