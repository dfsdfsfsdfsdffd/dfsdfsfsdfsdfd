import { createServerClient } from "@supabase/ssr";
import { randomBytes } from "crypto";
import { NextResponse, type NextRequest } from "next/server";

function absoluteUrl(value?: string) {
  if (!value) return "";
  const trimmed = value.trim();
  if (!trimmed) return "";

  try {
    return new URL(trimmed).toString();
  } catch {
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return "";
    }
  }
}

function discordRedirectUri(request: NextRequest) {
  const configuredRedirect = absoluteUrl(process.env.DISCORD_REDIRECT_URI);
  if (configuredRedirect) return configuredRedirect;

  const siteUrl = absoluteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (siteUrl) return new URL("/api/discord/callback", siteUrl).toString();

  return new URL("/api/discord/callback", request.url).toString();
}

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!supabaseUrl || !supabaseAnonKey || !clientId) {
    return NextResponse.redirect(new URL("/dashboard?discord=not-configured", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
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

  const state = randomBytes(24).toString("hex");
  const authorizeUrl = new URL("https://discord.com/api/oauth2/authorize");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", discordRedirectUri(request));
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", process.env.DISCORD_GUILD_ID && process.env.DISCORD_BOT_TOKEN ? "identify guilds.join" : "identify");
  authorizeUrl.searchParams.set("state", state);

  const redirect = NextResponse.redirect(authorizeUrl);
  redirect.cookies.set("softcard_discord_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 10 * 60,
    path: "/",
  });

  return redirect;
}
